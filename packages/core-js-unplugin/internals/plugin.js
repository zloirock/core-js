import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import { buildOffsetToLine, isCoreJSFile, parseDisableDirectives, mergeVisitors } from '@core-js/polyfill-provider/helpers';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors, createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import {
  canTransformDestructuring as sharedCanTransformDestructuring,
  resolveSymbolIteratorEntry,
  resolveSymbolInEntry,
  isTypeAnnotationNodeType,
  isPolyfillableOptional,
  findProxyGlobal,
} from '@core-js/polyfill-provider/detect-usage';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue from './transform-queue.js';
import detectEntries from './detect-entry.js';
import { estreeAdapter, createUsageVisitors, createSyntaxVisitors } from './detect-usage.js';

const typeResolvers = createResolveNodeType(nodeType, types);

export default function createPlugin(options) {
  const { resolver, createDebugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    isMemberLike: path => path.node?.type === 'MemberExpression',
    isCallee: (node, parent) => parent && parent.callee === node
      && (parent.type === 'CallExpression' || parent.type === 'NewExpression'),
    isSpreadElement: node => node?.type === 'SpreadElement',
  });

  const { method, absoluteImports, importStyle: importStyleOption, bundler } = options;
  const {
    mode, pkg, getModulesForEntry, getCoreJSEntry, isEntryNeeded,
    resolveUsage, resolvePure, resolvePureOrGlobalFallback,
  } = resolver;
  const isWebpack = bundler === 'webpack' || bundler === 'rspack';

  return {
    name: 'core-js-unplugin',
    // eslint-disable-next-line max-statements -- ok
    transform(code, id) {
      if (isCoreJSFile(id)) return null;

      // parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const { program: ast, comments, errors } = parseSync(id, code, { sourceType: 'module' });
      if (errors?.length) return null;

      const importStyle = importStyleOption ?? 'import';

      // check disable directives
      const offsetToLine = buildOffsetToLine(code);
      const disabledLines = parseDisableDirectives(comments, offsetToLine);
      if (disabledLines === true) return null; // entire file disabled

      function isDisabled(node) {
        if (!disabledLines) return false;
        if (node.start === undefined) return false;
        return disabledLines.has(offsetToLine(node.start));
      }

      const ms = new MagicString(code);
      const injector = new ImportInjector({ ms, pkg, mode, absoluteImports, importStyle });

      const debugOutput = createDebugOutput?.() ?? null;

      const { injectModulesForEntry, injectModulesForModeEntry, outputDebug } = createModuleInjectors({
        mode,
        getModulesForEntry,
        getDebugOutput() { return debugOutput; },
        injectGlobal: moduleName => injector.addGlobalImport(moduleName),
      });

      function injectPureImport(entry, hint) {
        debugOutput?.add(entry);
        return injector.addPureImport(entry, hint);
      }

      function finalize() {
        injector.flush();
        outputDebug();
        if (ms.hasChanged()) return { code: ms.toString(), map: ms.generateMap({ hires: 'boundary' }) };
        return null;
      }

      // entry-global mode
      if (method === 'entry-global') {
        const entryFound = detectEntries(ast, {
          getCoreJSEntry,
          injectModulesForEntry,
          isDisabled,
          ms,
        });
        if (entryFound) debugOutput?.markEntryFound();
        return finalize();
      }

      // usage-global mode
      if (method === 'usage-global') {
        const usageGlobalCallback = createUsageGlobalCallback({
          resolveUsage, injectModulesForModeEntry,
          isDisabled,
        });

        const usageVisitors = createUsageVisitors({ onUsage: usageGlobalCallback });
        const syntaxVisitors = createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });

        traverse(ast, mergeVisitors({
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          ...usageVisitors,
        }, syntaxVisitors));

        return finalize();
      }

      // usage-pure mode
      if (method === 'usage-pure') {
        const skippedNodes = new WeakSet();
        const transforms = new TransformQueue(code, ms);

        // per-callback mutable state + deferred collections
        // setScope() runs before each callback; genRef() reads the current scope
        const state = {
          scope: -1, // enclosing block body position (-1 = file scope)
          arrow: null, // innermost arrow expression body node needing block conversion
          scopedVars: new Map(), // bodyStart -> [var names]
          arrowVars: new Map(), // arrow body node -> [var names]
          destructuring: new Map(), // ObjectPattern node -> destructuring info
          setScope(metaPath) {
            this.scope = -1;
            this.arrow = null;
            for (let p = metaPath.parentPath; p; p = p.parentPath) {
              const { type, body } = p.node;
              if (type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') {
                if (!this.arrow) this.arrow = body;
              } else if (body?.type === 'BlockStatement' && (type === 'FunctionDeclaration'
                || type === 'FunctionExpression' || type === 'ArrowFunctionExpression')) {
                this.scope = body.start;
                return;
              }
            }
          },
          genRef(overrides) {
            const { arrow, scope } = overrides || this;
            // arrow expression body: var goes into a new block wrapping the body
            if (arrow) {
              const name = injector.generateRef(false);
              if (!this.arrowVars.has(arrow)) this.arrowVars.set(arrow, []);
              this.arrowVars.get(arrow).push(name);
              return name;
            }
            // block body: var inserted at body start; file scope: hoisted via injector.flush
            const name = injector.generateRef(scope === -1);
            if (scope !== -1) {
              if (!this.scopedVars.has(scope)) this.scopedVars.set(scope, []);
              this.scopedVars.get(scope).push(name);
            }
            return name;
          },
          applyTransforms(queue) {
            // wrap arrow expression bodies: () => expr -> () => { var _ref; return expr; }
            for (const [body, names] of this.arrowVars) {
              queue.add(body.start, body.end,
                `{ var ${ names.join(', ') }; return ${ code.slice(body.start, body.end) }; }`);
            }
            queue.apply();
            // insert var declarations at each function body start
            for (const [bodyStart, names] of this.scopedVars) {
              ms.appendRight(bodyStart + 1, `\nvar ${ names.join(', ') };`);
            }
          },
        };

        function nodeSrc(n) {
          return code.slice(n.start, n.end);
        }

        // strip ESTree ParenthesizedExpression wrapper when inner expression doesn't require parens
        function unwrapParens(node) {
          if (node.type === 'ParenthesizedExpression' && node.expression.type !== 'SequenceExpression') {
            return nodeSrc(node.expression);
          }
          return nodeSrc(node);
        }

        // check if a MemberExpression property is polyfillable (would produce its own inner transform)
        function hasPolyfillableProperty(memberNode) {
          const key = !memberNode.computed && memberNode.property?.type === 'Identifier' && memberNode.property.name;
          if (!key) return false;
          if (resolveBuiltIn({ kind: 'property', object: null, key, placement: null })) return true;
          const { object } = memberNode;
          if (object?.type === 'Identifier') {
            const resolved = resolveBuiltIn({ kind: 'property', object: object.name, key, placement: 'static' });
            if (resolved?.kind === 'static' || resolved?.kind === 'global') return true;
          }
          return false;
        }

        // walk the chain to find the first non-polyfillable optional
        // root: unwrapped source for guard; rootRaw: full source for body slicing
        function findChainRoot(node) {
          function rootResult(objectNode, deopt) {
            return { root: unwrapParens(objectNode), rootRaw: nodeSrc(objectNode), canDeopt: deopt };
          }
          if (node.optional) {
            // polyfillable global/static optional (Array?.from, globalThis?.Map): import is always
            // defined, no null-check needed. Instance optional (arr?.flat): object may be null.
            if (isPolyfillableOptional(node, null, estreeAdapter, resolveBuiltIn)) return { root: null };
            return rootResult(node.object, true);
          }
          let current = node.object || node.callee;
          let canDeopt = true;
          while (current && typeof current === 'object') {
            if (current.type === 'MemberExpression' && hasPolyfillableProperty(current)) canDeopt = false;
            if (current.optional) {
              if (isPolyfillableOptional(current, null, estreeAdapter, resolveBuiltIn)) return { root: null };
              return rootResult(current.object, canDeopt);
            }
            current = current.object || current.callee;
          }
          return { root: null };
        }

        // build the replacement text for an instance method or Symbol.iterator transform
        function buildReplacement(binding, objectSrc, opts) {
          const { isCall, isNonIdent, optionalRoot, rootRaw, canDeopt, optionalCall, args } = opts;
          let bodyObj = objectSrc;
          let guard = '';
          let guardRef = null;

          if (canDeopt) bodyObj = deoptionalize(bodyObj);

          if (optionalRoot) {
            if (/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)) {
              guard = `${ optionalRoot } == null ? void 0 : `;
            } else {
              guardRef = state.genRef();
              guard = `(${ guardRef } = ${ optionalRoot }) == null ? void 0 : `;
              bodyObj = guardRef + bodyObj.slice(deoptionalize(rootRaw).length);
            }
          }

          let result;
          if (!isCall) {
            result = `${ guard }${ binding }(${ bodyObj })`;
          } else {
            const ref = isNonIdent && bodyObj !== guardRef ? state.genRef() : null;
            const obj = ref || bodyObj;
            const firstArg = ref ? `${ ref } = ${ bodyObj }` : bodyObj;
            const dot = optionalCall ? '?.' : '.';
            const argsPart = args ? `, ${ args }` : '';
            result = `${ guard }${ binding }(${ firstArg })${ dot }call(${ obj }${ argsPart })`;
          }
          return result;
        }

        // replace `?.` outside literals: `?.prop` -> `.prop`, `?.[x]` / `?.()` -> `[x]` / `()`
        // handles string/template literals (with nesting), and regex literals
        function deoptionalize(src) {
          let result = '';
          // track whether `/` starts a regex (after operator, open paren/bracket, or start)
          let prevToken = '';
          for (let i = 0; i < src.length; i++) {
            const ch = src[i];
            if (ch === '"' || ch === "'") {
              const start = i;
              for (i++; i < src.length; i++) {
                if (src[i] === '\\') i++;
                else if (src[i] === ch) break;
              }
              result += src.slice(start, i + 1);
              prevToken = ')'; // string acts like a value - next `/` is division
            } else if (ch === '`') {
              const tmpl = skipTemplate(i);
              result += tmpl.text;
              i = tmpl.end;
              prevToken = ')';
            } else if (ch === '/' && isRegexContext(prevToken)) {
              const start = i;
              for (i++; i < src.length; i++) {
                if (src[i] === '\\') i++;
                else if (src[i] === '/') break;
              }
              // skip flags
              while (i + 1 < src.length && /[dgimsuvy]/.test(src[i + 1])) i++;
              result += src.slice(start, i + 1);
              prevToken = ')';
            } else if (ch === '?' && src[i + 1] === '.') {
              i++; // consume `?.`
              const next = src[i + 1];
              if (next !== '[' && next !== '(') result += '.';
              prevToken = '.';
            } else {
              result += ch;
              if (!/\s/.test(ch)) prevToken = ch;
            }
          }
          return result;

          function isRegexContext(prev) {
            // `/` is regex after operators, open parens/brackets, comma, semicolon, start, or keywords-like tokens
            return !prev || '=!<>+-*/%&|^~({[,;:?'.includes(prev);
          }

          function skipTemplate(start) {
            let text = src[start]; // opening backtick
            let depth = 1;
            let j = start + 1;
            while (j < src.length && depth > 0) {
              if (src[j] === '\\') {
                text += src[j] + (src[j + 1] ?? '');
                j += 2;
              } else if (src[j] === '$' && src[j + 1] === '{') {
                text += '${';
                j += 2;
                depth++;
              } else if (src[j] === '}' && depth > 1) {
                text += '}';
                j++;
                depth--;
              } else if (src[j] === '`' && depth === 1) {
                text += '`';
                j++;
                depth--;
              } else {
                text += src[j];
                j++;
              }
            }
            return { text, end: j - 1 };
          }
        }

        // position past optional `?.` token after pos, skipping whitespace and comments
        // keepDot=true: consume only `?` (non-computed member: obj?.prop -> obj.prop)
        // keepDot=false: consume `?.` (computed member or call: obj?.[x] -> obj[x], fn?.() -> fn())
        function afterOptional(pos, keepDot) {
          let p = pos;
          while (p < code.length) {
            if (code[p] === '/' && code[p + 1] === '/') {
              while (p < code.length && code[p] !== '\n') p++;
            } else if (code[p] === '/' && code[p + 1] === '*') {
              p += 2;
              while (p < code.length && !(code[p] === '*' && code[p + 1] === '/')) p++;
              p += 2;
            } else if (code[p] === '?' || code[p] === '.' || code[p] === '[' || code[p] === '(') {
              break;
            } else {
              p++;
            }
          }
          return code[p] === '?' && code[p + 1] === '.' ? (keepDot ? p + 1 : p + 2) : pos;
        }

        function skipProxyGlobal(node) {
          const proxy = findProxyGlobal(node);
          if (proxy) skippedNodes.add(proxy);
        }

        // ternary guard needs () only when parent operator has higher precedence than ?:
        const NEEDS_GUARD_PARENS = new Set([
          'BinaryExpression', 'LogicalExpression', 'UnaryExpression',
          'AwaitExpression', 'UpdateExpression',
          'TaggedTemplateExpression', 'SpreadElement',
        ]);

        // resolve optional root + skip redundant guard when nested inside an outer transform
        function resolveOptionalRoot(node, parent, isCall) {
          let { root, rootRaw, canDeopt } = findChainRoot(node);
          if (root) {
            const start = isCall ? parent.start : node.start;
            const end = isCall ? parent.end : node.end;
            // non-optional: outer already guards → suppress
            // optional: suppress only if outer guards the SAME root
            if (node.optional ? transforms.hasGuardFor(start, end, root) : transforms.containsRange(start, end)) {
              root = null;
              canDeopt = true;
            }
          }
          return { optionalRoot: root, rootRaw, canDeopt };
        }

        // does guard ternary need () to preserve correct precedence?
        function guardNeedsParens(metaPath, isCall, start, end) {
          let outer = (isCall ? metaPath.parentPath : metaPath)?.parentPath;
          if (outer?.node?.type === 'ChainExpression') outer = outer.parentPath;
          // higher-precedence operator parent
          if (NEEDS_GUARD_PARENS.has(outer?.node?.type)) return true;
          // ternary test position: guard ternary merges with outer ternary
          if (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === end) return true;
          // ?. continuation after this range (top-level only — inner transforms get composed)
          return code[end] === '?' && code[end + 1] === '.' && !transforms.containsRange(start, end);
        }

        // build replacement, wrap guard if needed, add to transform queue
        function addInstanceTransform(binding, node, parent, metaPath, isCall, opts) {
          const objectSrc = unwrapParens(node.object);
          const isNonIdent = node.object.type !== 'Identifier';
          const { optionalRoot, rootRaw, canDeopt } = resolveOptionalRoot(node, parent, isCall);
          const argsSrc = isCall ? parent.arguments.map(a => nodeSrc(a)).join(', ') : null;
          const start = isCall ? parent.start : node.start;
          const end = isCall ? parent.end : node.end;

          let replacement = buildReplacement(binding, objectSrc, {
            isCall, isNonIdent, optionalRoot, rootRaw, canDeopt,
            optionalCall: isCall && parent.optional, args: argsSrc, ...opts,
          });
          if (optionalRoot && guardNeedsParens(metaPath, isCall, start, end)) {
            replacement = `(${ replacement })`;
          }
          transforms.add(start, end, replacement, optionalRoot);
          if (isCall) skippedNodes.add(parent);
          skipProxyGlobal(node);
        }

        function handleSymbolIterator(meta, node, parent, metaPath) {
          const entry = resolveSymbolIteratorEntry(node, parent);
          if (!isEntryNeeded(entry)) return;
          const isCallParent = parent?.type === 'CallExpression' && parent.callee === node;
          const binding = injectPureImport(entry, entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod');
          addInstanceTransform(binding, node, parent, metaPath, isCallParent, {
            isCall: isCallParent && (parent.arguments.length > 0 || parent.optional),
          });
          if (node.property) skippedNodes.add(node.property);
        }

        function replaceInstance(binding, node, parent, metaPath) {
          const isCall = parent?.type === 'CallExpression' && parent.callee === node;
          addInstanceTransform(binding, node, parent, metaPath, isCall, {});
        }

        // deferred destructuring: collect polyfilled properties per ObjectPattern
        // state.destructuring: key: ObjectPattern node -> [{propNode, localName, binding, kind, initSrc}]

        function canTransformDestructuring(metaPath) {
          const objectPattern = metaPath.parent;
          if (!objectPattern) return false;
          const declaratorPath = metaPath.parentPath?.parentPath;
          if (!declaratorPath?.node) return false;
          if (declaratorPath.node.type === 'Property') return false;
          if (!sharedCanTransformDestructuring({
            parentType: declaratorPath.node.type,
            parentInit: declaratorPath.node.init,
            grandParentType: declaratorPath.parentPath?.parentPath?.node?.type,
            patternProperties: objectPattern.properties,
          })) return false;
          // ESTree-specific: assignment must be inside ExpressionStatement (unwrap ParenthesizedExpression)
          if (declaratorPath.node.type === 'AssignmentExpression') {
            let exprParent = declaratorPath.parentPath;
            while (exprParent?.node?.type === 'ParenthesizedExpression') exprParent = exprParent.parentPath;
            if (exprParent?.node?.type !== 'ExpressionStatement') return false;
          }
          return true;
        }

        function handleDestructuringPure(meta, metaPath, propNode) {
          if (!canTransformDestructuring(metaPath)) return;
          const { value } = propNode;
          // skip nested patterns (recursive expansion is too complex for text-based transforms)
          if (value?.type === 'ObjectPattern' || value?.type === 'ArrayPattern') return;
          // default values with non-identifier target can't be extracted
          if (value?.type === 'AssignmentPattern' && value.left?.type !== 'Identifier') return;
          const pureResult = resolvePure(meta, metaPath);
          if (!pureResult) return;
          const { entry: importEntry, kind, hintName } = pureResult;
          const binding = injectPureImport(importEntry, hintName);

          const objectPattern = metaPath.parent;
          // { from = [] }: localName = "from", defaultSrc = "[]"
          // { from }: localName = "from", defaultSrc = null
          let defaultSrc = null;
          let localName;
          if (value?.type === 'AssignmentPattern') {
            localName = value.left.name;
            defaultSrc = nodeSrc(value.right);
          } else {
            localName = value?.type === 'Identifier' ? value.name : propNode.key?.name;
          }
          if (!localName) return;

          // find statement path:
          // VariableDeclaration: Property -> ObjectPattern -> VariableDeclarator -> VariableDeclaration
          // assignment: Property -> ObjectPattern -> AssignmentExpression -> ExpressionStatement
          const declaratorPath = metaPath.parentPath?.parentPath;
          const isAssignment = declaratorPath?.node?.type === 'AssignmentExpression';
          let declPath = declaratorPath?.parentPath;
          // unwrap ParenthesizedExpression for assignment: ({ from } = Array) -> ExpressionStatement
          if (isAssignment) {
            while (declPath?.node?.type === 'ParenthesizedExpression') declPath = declPath.parentPath;
          }
          // get init source for instance methods
          const initNode = isAssignment ? declaratorPath?.node?.right : declaratorPath?.node?.init;
          const initSrc = initNode ? nodeSrc(initNode) : null;

          if (!state.destructuring.has(objectPattern)) {
            state.destructuring.set(objectPattern, {
              entries: [],
              allProps: objectPattern.properties || [],
              declPath,
              declaratorPath,
              isAssignment,
              initSrc,
              initIsIdent: initNode?.type === 'Identifier',
              scopeSnapshot: { scope: state.scope, arrow: state.arrow },
            });
          }
          state.destructuring.get(objectPattern).entries.push({ propNode, localName, binding, kind, defaultSrc });
        }

        function applyDestructuringTransforms() {
          // group by declPath node to handle multiple destructurings in the same VariableDeclaration
          const byStatement = new Map();
          for (const [, info] of state.destructuring) {
            if (!info.declPath?.node || !info.declaratorPath?.node) continue;
            const key = info.declPath.node;
            if (!byStatement.has(key)) byStatement.set(key, []);
            byStatement.get(key).push(info);
          }

          for (const [, infos] of byStatement) {
            const [{ declPath, isAssignment }] = infos;
            const isExport = !isAssignment && declPath.parentPath?.node?.type === 'ExportNamedDeclaration';
            const isForInit = !isAssignment && declPath.parentPath?.node?.type === 'ForStatement';
            const replaceNode = isExport ? declPath.parentPath.node : declPath.node;
            const prefix = isExport ? 'export ' : '';
            const keyword = isAssignment ? '' : `${ declPath.node.kind } `;
            // for-init: single comma-separated declaration; otherwise: separate statements
            const stmtPrefix = isForInit ? '' : `${ prefix }${ keyword }`;
            const memoPrefix = isForInit ? '' : 'const ';
            const polyfilledDeclarators = new Set(infos.map(i => i.declaratorPath.node));
            const parts = [];

            function propKeySource(p) {
              return p.computed ? `[${ nodeSrc(p.key) }]` : nodeSrc(p.key);
            }

            for (const info of infos) {
              const { entries, allProps, initSrc, initIsIdent, scopeSnapshot } = info;
              const polyfillKeys = new Set(entries.map(e => e.propNode));
              const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
              const remaining = allProps.filter(p => !polyfillKeys.has(p));
              const hasInstance = entries.some(e => e.kind === 'instance');
              const needsMemo = hasInstance && !initIsIdent && (entries.length > 1 || remaining.length > 0 || hasRest);
              let objRef = initSrc;
              if (needsMemo && initSrc) {
                objRef = injector.generateRef(false);
                parts.push(`${ memoPrefix }${ objRef } = ${ initSrc }`);
              }

              for (const e of entries) {
                const isInstance = e.kind === 'instance' && initSrc;
                const valueSrc = isInstance ? `${ e.binding }(${ objRef })` : e.binding;
                if (e.defaultSrc) {
                  // default: localName = value === void 0 ? default : value
                  // instance calls: inline assignment (_ref = call()) to avoid double evaluation
                  let ref = null;
                  if (isInstance) {
                    ref = state.genRef(scopeSnapshot);
                  }
                  const test = ref ? `(${ ref } = ${ valueSrc })` : valueSrc;
                  parts.push(`${ stmtPrefix }${ e.localName } = ${ test } === void 0 ? ${ e.defaultSrc } : ${ ref || valueSrc }`);
                } else {
                  parts.push(`${ stmtPrefix }${ e.localName } = ${ valueSrc }`);
                }
              }

              const rebuiltProps = hasRest
                ? allProps.map(p => polyfillKeys.has(p) ? `${ propKeySource(p) }: ${ injector.generateUnusedName() }` : nodeSrc(p))
                : remaining.map(p => nodeSrc(p));
              if (rebuiltProps.length > 0) {
                parts.push(isAssignment
                  ? `({ ${ rebuiltProps.join(', ') } } = ${ objRef })`
                  : `${ stmtPrefix }{ ${ rebuiltProps.join(', ') } } = ${ objRef }`);
              }
            }

            if (!isAssignment && declPath.node.declarations?.length > polyfilledDeclarators.size) {
              const others = declPath.node.declarations.filter(d => !polyfilledDeclarators.has(d)).map(d => nodeSrc(d));
              if (others.length) parts.push(`${ stmtPrefix }${ others.join(', ') }`);
            }

            if (isForInit) {
              transforms.add(replaceNode.start, replaceNode.end, `${ keyword }${ parts.join(', ') }`);
            } else {
              transforms.add(replaceNode.start, replaceNode.end, `${ parts.join(';\n') };`);
            }
          }
        }

        function isInTypeAnnotation(path) {
          for (let current = path.parentPath; current; current = current.parentPath) {
            if (isTypeAnnotationNodeType(current.node?.type)) return true;
          }
          return false;
        }

        const usagePureCallback = (meta, metaPath) => {
          if (isDisabled(metaPath.node)) return;
          if (skippedNodes.has(metaPath.node)) return;
          if (isInTypeAnnotation(metaPath)) return;
          state.setScope(metaPath);
          const { node } = metaPath;
          const parent = metaPath.parentPath?.node;

          if (meta.kind === 'in') {
            const symbolIn = resolveSymbolInEntry(meta.key);
            if (symbolIn && isEntryNeeded(symbolIn.entry)) {
              const binding = injectPureImport(symbolIn.entry, symbolIn.hint);
              if (meta.key === 'Symbol.iterator') {
                transforms.add(node.start, node.end, `${ binding }(${ nodeSrc(node.right) })`);
              } else {
                transforms.add(node.left.start, node.left.end, binding);
              }
            } else if (meta.object) {
              // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable
              const resolved = resolvePureOrGlobalFallback(meta, metaPath);
              if (resolved.result) {
                transforms.add(node.start, node.end, 'true');
                // prevent child visitors from adding unused imports for the replaced expression
                skippedNodes.add(node.right);
                skipProxyGlobal(node.right);
              }
            }
            return;
          }

          // unwrap ChainExpression for delete check: delete obj?.prop -> UnaryExpression -> ChainExpression -> MemberExpression
          const deleteParent = parent?.type === 'ChainExpression' ? metaPath.parentPath?.parentPath?.node : parent;
          if (deleteParent?.type === 'UnaryExpression' && deleteParent.operator === 'delete') return;

          if (meta.kind === 'property') {
            if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
              return handleDestructuringPure(meta, metaPath, node);
            }
            if (node.type !== 'MemberExpression') return;
            if (parent?.type === 'UpdateExpression') return;
            if (node.object?.type === 'Super') return;
            if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator(meta, node, parent, metaPath);
          }

          const { result: pureResult, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
          if (fallback && node.type === 'MemberExpression') {
            skipProxyGlobal(node);
            const binding = injectPureImport(fallback.entry, fallback.hintName);
            // deoptionalize: globalThis?.foo -> _globalThis.foo (polyfill import is always defined)
            const end = node.optional ? afterOptional(node.object.end, !node.computed) : node.object.end;
            transforms.add(node.object.start, end, binding);
            return;
          }
          if (!pureResult) return;
          const { entry: importEntry, kind, hintName } = pureResult;
          const binding = injectPureImport(importEntry, hintName);

          // mark proxy global (globalThis, self, etc.) as skipped to prevent
          // the Identifier visitor from adding an unused import
          if (node.type === 'MemberExpression') skipProxyGlobal(node);

          if (kind === 'instance' && node.type === 'MemberExpression') {
            replaceInstance(binding, node, parent, metaPath);
          } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
            // deoptionalize `?.` when replacing global/static callee:
            // - optional call on non-optional member: Map?.() / globalThis.Map?.() -> _Map()
            //   but NOT globalThis?.Map?.() -> _Map?.() (preserve user's optional call intent)
            // - optional member parent: globalThis?.X -> _globalThis.X
            let { end } = node;
            if (parent?.type === 'CallExpression' && parent.optional && parent.callee === node && !node.optional) {
              end = afterOptional(node.end, false);
            } else if (parent?.type === 'MemberExpression' && parent.optional && parent.object === node) {
              end = afterOptional(node.end, !parent.computed);
            }
            transforms.add(node.start, end, binding);
          }
        };

        traverse(ast, {
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          ...createUsageVisitors({ onUsage: usagePureCallback, suppressProxyGlobals: true, walkAnnotations: false }),
        });
        applyDestructuringTransforms();
        state.applyTransforms(transforms);
        return finalize();
      }

      return null;
    },
  };
}
