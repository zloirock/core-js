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

// ternary guard needs () only when parent operator has higher precedence than ?:
// or parent grammar restricts the expression (extends clause expects LeftHandSideExpression)
const NEEDS_GUARD_PARENS = new Set([
  'BinaryExpression',
  'LogicalExpression',
  'UnaryExpression',
  'AwaitExpression',
  'UpdateExpression',
  'TaggedTemplateExpression',
  'SpreadElement',
  'ClassDeclaration',
  'ClassExpression',
]);

export default function createPlugin(options) {
  const { resolver, createDebugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    isMemberLike: path => path.node?.type === 'MemberExpression',
    isCallee: (node, parent) => {
      if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return false;
      let { callee } = parent;
      while (callee?.type === 'ParenthesizedExpression') callee = callee.expression;
      return callee === node;
    },
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

      // CJS files (.cjs, .cts) and files that look like CommonJS get 'require' style by default
      const isCJSFile = /\.c[jt]s(?:[#?][^#?]*)?$/.test(id);
      // parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const { program: ast, comments, errors } = parseSync(id, code, {
        sourceType: isCJSFile ? 'script' : 'module',
      });
      if (errors?.length) return null;

      const importStyle = importStyleOption ?? (isCJSFile ? 'require' : 'import');

      // check disable directives
      const offsetToLine = buildOffsetToLine(code);
      const disabledLines = parseDisableDirectives(comments, offsetToLine);
      if (disabledLines === true) return null; // entire file disabled

      function isDisabled(node) {
        if (!disabledLines) return false;
        if (node.start === undefined) return false;
        return disabledLines.has(offsetToLine(node.start));
      }

      const ms = new MagicString(code, { filename: id });
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
        if (!ms.hasChanged()) return null;
        return {
          code: ms.toString(),
          map: ms.generateMap({ source: id, includeContent: true, hires: 'boundary' }),
        };
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
              } else if (type === 'StaticBlock') {
                // StaticBlock.body is an array (not BlockStatement); find the { position
                let pos = p.node.start;
                while (pos < p.node.end && code[pos] !== '{') pos++;
                this.scope = pos;
                return;
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

        // scan forward from `pos` in `src`, skipping whitespace and comments, until a non-gap char
        function skipGap(src, pos) {
          let p = pos;
          while (p < src.length) {
            const ch = src[p];
            if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
              p++;
              continue;
            }
            if (ch === '/' && src[p + 1] === '/') {
              while (p < src.length && src[p] !== '\n') p++;
              continue;
            }
            if (ch === '/' && src[p + 1] === '*') {
              p += 2;
              while (p < src.length && !(src[p] === '*' && src[p + 1] === '/')) p++;
              p += 2;
              continue;
            }
            break;
          }
          return p;
        }

        // strip `?.` at known absolute positions within a source slice
        // positions are absolute offsets in the original source (object end); baseOffset maps to slice start
        // scans forward from position to find the `?.` token (skipping whitespace/comments)
        function stripOptionalDots(src, baseOffset, positions) {
          if (!positions?.length) return src;
          let result = '';
          let prev = 0;
          for (const absPos of positions) {
            let rel = absPos - baseOffset;
            if (rel < 0 || rel >= src.length) continue;
            // skip whitespace/comments between object end and `?.` token
            rel = skipGap(src, rel);
            if (rel >= src.length || src[rel] !== '?' || src[rel + 1] !== '.') continue;
            result += src.slice(prev, rel);
            // check whether computed/call follows: scan past `?.` and any whitespace/comments
            const afterQ = skipGap(src, rel + 2);
            // ?.[ or ?.( -> skip both ? and . ; ?.prop -> skip ? only (keep .)
            prev = (src[afterQ] === '[' || src[afterQ] === '(') ? rel + 2 : rel + 1;
          }
          return result + src.slice(prev);
        }

        // walk the chain to find the first non-polyfillable optional
        function findChainRoot(node) {
          function makeResult(optionalNode) {
            const rootNode = optionalNode.object || optionalNode.callee;
            // collect `?.` positions from polyfill node down to optionalNode (for stripping)
            const deoptPositions = [];
            let cur = node.object || node.callee;
            while (cur && typeof cur === 'object') {
              if (cur.optional) deoptPositions.push(cur.object?.end ?? cur.callee?.end);
              if (cur === optionalNode) break;
              cur = cur.object || cur.callee;
            }
            return { root: unwrapParens(rootNode), rootRaw: nodeSrc(rootNode), deoptPositions };
          }
          const isPoly = n => isPolyfillableOptional(n, null, estreeAdapter, resolveBuiltIn);
          if (node.optional) {
            return isPoly(node) ? { root: null } : makeResult(node);
          }
          let current = node.object || node.callee;
          while (current && typeof current === 'object') {
            if (current.optional) {
              return isPoly(current) ? { root: null } : makeResult(current);
            }
            current = current.object || current.callee;
          }
          return { root: null };
        }

        // build the replacement text for an instance method or Symbol.iterator transform
        function buildReplacement(binding, objectSrc, opts) {
          const { isCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions, optionalCall, args, objectStart } = opts;
          const strip = src => stripOptionalDots(src, objectStart ?? 0, deoptPositions);
          let bodyObj = deoptPositions?.length ? strip(objectSrc) : objectSrc;
          let guard = '';
          let guardRef = null;

          if (optionalRoot) {
            if (/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)) {
              guard = `${ optionalRoot } == null ? void 0 : `;
            } else {
              guardRef = state.genRef();
              guard = `(${ guardRef } = ${ optionalRoot }) == null ? void 0 : `;
              bodyObj = guardRef + bodyObj.slice(strip(rootRaw).length);
            }
          }

          let result;
          if (isNew) {
            // new arr.at(0) -> new (_at(arr))(0) — preserve user's `new` on the polyfill callee
            const argsPart = args || '';
            result = `${ guard }new (${ binding }(${ bodyObj }))(${ argsPart })`;
          } else if (!isCall) {
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

        // position past optional `?.` token after pos, skipping whitespace and comments
        // keepDot=true: consume only `?` (non-computed member: obj?.prop -> obj.prop)
        // keepDot=false: consume `?.` (computed member or call: obj?.[x] -> obj[x], fn?.() -> fn())
        function afterOptional(pos, keepDot) {
          const p = skipGap(code, pos);
          return code[p] === '?' && code[p + 1] === '.' ? (keepDot ? p + 1 : p + 2) : pos;
        }

        function skipProxyGlobal(node) {
          const proxy = findProxyGlobal(node);
          if (proxy) skippedNodes.add(proxy);
        }

        // resolve optional root + skip redundant guard when nested inside an outer transform
        function resolveOptionalRoot(node, parent, isCall) {
          let { root, rootRaw, deoptPositions } = findChainRoot(node);
          if (root) {
            const start = isCall ? parent.start : node.start;
            const end = isCall ? parent.end : node.end;
            if (node.optional ? transforms.hasGuardFor(start, end, root) : transforms.containsRange(start, end)) {
              root = null;
            }
          }
          return { optionalRoot: root, rootRaw, deoptPositions };
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
          // skipGap handles whitespace/comments between the expression end and ?.
          const p = skipGap(code, end);
          return code[p] === '?' && code[p + 1] === '.' && !transforms.containsRange(start, end);
        }

        // build replacement, wrap guard if needed, add to transform queue
        // replacementIsCall overrides isCall for buildReplacement (used by Symbol.iterator:
        // the parent range is the call, but the replacement is a simple call, not .call())
        function addInstanceTransform(binding, node, parent, metaPath, isCall, replacementIsCall = isCall) {
          const objectSrc = unwrapParens(node.object);
          const isNonIdent = unwrapNode(node.object).type !== 'Identifier';
          const { optionalRoot, rootRaw, deoptPositions } = resolveOptionalRoot(node, parent, isCall);
          // preserve comments in arguments by slicing original source between arg ranges
          const argsSrc = isCall && parent.arguments.length
            ? code.slice(parent.arguments[0].start, parent.arguments.at(-1).end)
            : null;
          const start = isCall ? parent.start : node.start;
          const end = isCall ? parent.end : node.end;
          const isNew = parent?.type === 'NewExpression' && isCall;

          let replacement = buildReplacement(binding, objectSrc, {
            isCall: replacementIsCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
            optionalCall: isCall && parent.optional, args: argsSrc,
            objectStart: node.object.start,
          });
          if (optionalRoot && guardNeedsParens(metaPath, isCall, start, end)) {
            replacement = `(${ replacement })`;
          }
          transforms.add(start, end, replacement, optionalRoot);
          if (isCall) skippedNodes.add(parent);
          skipProxyGlobal(node);
        }

        // unwrap ESTree-specific wrapper nodes to reach the inner expression
        function unwrapNode(n) {
          while (n?.type === 'ParenthesizedExpression' || n?.type === 'ChainExpression') n = n.expression;
          return n;
        }

        // check if parent is a call/new expression with node as callee
        function isCallee(node, parent) {
          if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return false;
          return unwrapNode(parent.callee) === node;
        }

        function handleSymbolIterator(meta, node, parent, metaPath) {
          const isCallParent = isCallee(node, parent);
          // get-iterator returns the materialized iterator; get-iterator-method returns the method.
          // use get-iterator only for plain CallExpression with no args — never for NewExpression
          const isPlainCall = isCallParent && parent.type === 'CallExpression';
          const entry = isPlainCall && parent.arguments.length === 0 && !parent.optional
            ? 'get-iterator' : 'get-iterator-method';
          if (!isEntryNeeded(entry)) return;
          const binding = injectPureImport(entry, entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod');
          addInstanceTransform(binding, node, parent, metaPath, isCallParent,
            isCallParent && (parent.arguments.length > 0 || parent.optional));
          if (node.property) skippedNodes.add(node.property);
        }

        function replaceInstance(binding, node, parent, metaPath) {
          const isCall = isCallee(node, parent);
          addInstanceTransform(binding, node, parent, metaPath, isCall);
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
              initStart: initNode?.start,
              initEnd: initNode?.end,
              // init identifier name for lazy re-injection when rest/remaining need the polyfilled init
              initIdentName: initNode?.type === 'Identifier' ? initNode.name : null,
              scopeSnapshot: { scope: state.scope, arrow: state.arrow },
            });
            // prevent unused global import for init identifier (e.g., _Promise from { resolve } = Promise)
            // — destructuring replaces properties with direct polyfill imports;
            // if rest/remaining need the init, applyDestructuringTransforms re-injects it lazily
            if (initNode) skippedNodes.add(initNode);
          }
          state.destructuring.get(objectPattern).entries.push({ propNode, localName, binding, kind, defaultSrc });
        }

        // eslint-disable-next-line max-statements -- ok
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
              const { entries, allProps, initSrc, initIdentName, initStart, initEnd, scopeSnapshot } = info;
              // if the init has a queued transform (e.g. Promise -> _Promise), extract it
              // to prevent composition corruption (Promise in _Promise$resolve -> __Promise$resolve)
              let initTransformed = (initStart !== undefined && initEnd !== undefined
                ? transforms.extractContent(initStart, initEnd) : null) ?? initSrc;
              const polyfillKeys = new Set(entries.map(e => e.propNode));
              const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
              const remaining = allProps.filter(p => !polyfillKeys.has(p));
              const hasInstance = entries.some(e => e.kind === 'instance');
              // if remaining/rest/instance needs init object, ensure it's polyfilled
              // (init was skipped during collection to prevent unused imports — re-inject lazily)
              if ((remaining.length > 0 || hasRest || hasInstance) && initTransformed === initSrc && initIdentName) {
                const initResolved = resolvePure({ kind: 'global', name: initIdentName }, null);
                if (initResolved) initTransformed = injectPureImport(initResolved.entry, initResolved.hintName);
              }
              const needsMemo = hasInstance && !initIdentName && (entries.length > 1 || remaining.length > 0 || hasRest);
              let objRef = initTransformed;
              if (needsMemo && initTransformed) {
                objRef = injector.generateRef(false);
                parts.push(`${ memoPrefix }${ objRef } = ${ initTransformed }`);
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
          // unwrap ParenthesizedExpression and ChainExpression to reach the semantic parent
          // oxc-parser preserves parens as AST nodes (Babel strips them);
          // ChainExpression is an ESTree wrapper with no semantic meaning for our purposes
          let { parentPath } = metaPath;
          while (parentPath?.node?.type === 'ParenthesizedExpression'
            || parentPath?.node?.type === 'ChainExpression') parentPath = parentPath.parentPath;
          const parent = parentPath?.node;

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

          // delete check (ChainExpression and ParenthesizedExpression already unwrapped above)
          if (parent?.type === 'UnaryExpression' && parent.operator === 'delete') return;

          if (meta.kind === 'property') {
            if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
              return handleDestructuringPure(meta, metaPath, node);
            }
            if (node.type !== 'MemberExpression') return;
            if (parent?.type === 'UpdateExpression') return;
            if (node.object?.type === 'Super') return;
            if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
            // skip instance method used as tagged template tag — replacing callee breaks `this` binding
            if (meta.placement === 'prototype'
              && parent?.type === 'TaggedTemplateExpression' && parent.tag === node) return;
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
            // deoptionalize `?.` when replacing global/static callee — the polyfill import is always
            // defined, so optional chaining on it is redundant:
            // - optional call: Map?.() / globalThis.Map?.() / globalThis?.Map?.() -> _Map()
            // - optional member parent: globalThis?.X -> _globalThis.X
            let { end } = node;
            if (parent?.type === 'CallExpression' && parent.optional && isCallee(node, parent)) {
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
