import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import {
  buildOffsetToLine,
  buildSuperStaticMeta,
  isCoreJSFile,
  mergeVisitors,
  parseDisableDirectives,
} from '@core-js/polyfill-provider/helpers';
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

// end position of the leading directive prologue ('use strict', etc.) - 0 if none.
// oxc-parser sets `directive` to a string for directive ExpressionStatements;
// regular ExpressionStatements have `directive: null` (TSX) or omit the field (JS)
function directivePrologueEnd(ast) {
  let end = 0;
  for (const stmt of ast.body) {
    if (stmt.type !== 'ExpressionStatement' || typeof stmt.directive !== 'string') break;
    end = stmt.end;
  }
  return end;
}

// content-based CJS detection. ESM markers (top-level import/export) override CJS markers.
// recognised CJS markers: `module.exports = …`, `exports.X = …`, `module.exports.X = …`
// at top level (the most common transpiler / hand-written CJS shapes).
const ESM_MARKER_TYPES = new Set([
  'ExportAllDeclaration',
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ImportDeclaration',
]);

const isNamedIdent = (node, name) => node?.type === 'Identifier' && node.name === name;

const isStaticMember = (node, objName, propName) => node?.type === 'MemberExpression' && !node.computed
  && isNamedIdent(node.object, objName) && isNamedIdent(node.property, propName);

function isCommonJSAssignTarget(left) {
  if (left?.type !== 'MemberExpression' || left.computed) return false;
  // module.exports = ...      |  exports.X = ...           |  module.exports.X = ...
  return isStaticMember(left, 'module', 'exports')
    || isNamedIdent(left.object, 'exports')
    || isStaticMember(left.object, 'module', 'exports');
}

function detectCommonJS(ast) {
  let hasCJS = false;
  for (const stmt of ast.body) {
    if (ESM_MARKER_TYPES.has(stmt.type)) return false;
    if (hasCJS || stmt.type !== 'ExpressionStatement') continue;
    const { expression } = stmt;
    if (expression?.type === 'AssignmentExpression' && isCommonJSAssignTarget(expression.left)) hasCJS = true;
  }
  return hasCJS;
}

// node types that are safe to double-evaluate (no side effects, no temp ref needed)
const NO_REF_NEEDED = new Set(['Identifier', 'ThisExpression']);

// TS-only expression wrappers - runtime no-ops that forward to their `.expression` child
const TS_EXPR_WRAPPERS = new Set([
  'TSNonNullExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSInstantiationExpression',
]);

// collect every binding name declared anywhere in the AST so the import injector
// avoids picking a UID that collides with a user-declared identifier in any nested scope
// `var _at = 1` inside a function should not be shadowed by a top-level `import _at from ...`
function collectAllBindingNames(ast) {
  const names = new Set();
  function addPattern(node) {
    if (!node) return;
    switch (node.type) {
      case 'Identifier': names.add(node.name); break;
      case 'ObjectPattern':
        for (const p of node.properties) addPattern(p.type === 'Property' ? p.value : p.argument);
        break;
      case 'ArrayPattern': for (const e of node.elements) if (e) addPattern(e); break;
      case 'AssignmentPattern': addPattern(node.left); break;
      case 'RestElement': addPattern(node.argument); break;
    }
  }
  const addId = node => { if (node.id) names.add(node.id.name); };
  const addParams = node => { for (const p of node.params) addPattern(p); };
  const addFunction = path => {
    addId(path.node);
    addParams(path.node);
  };
  const addLocal = path => names.add(path.node.local.name);
  traverse(ast, {
    VariableDeclarator: path => addPattern(path.node.id),
    FunctionDeclaration: addFunction,
    FunctionExpression: addFunction,
    ArrowFunctionExpression: path => addParams(path.node),
    ClassDeclaration: path => addId(path.node),
    ClassExpression: path => addId(path.node),
    CatchClause: path => addPattern(path.node.param),
    ImportSpecifier: addLocal,
    ImportDefaultSpecifier: addLocal,
    ImportNamespaceSpecifier: addLocal,
  });
  return names;
}

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
  // per-instance type resolvers - guardsCache/resolveCache WeakMaps don't leak across plugin instances
  const typeResolvers = createResolveNodeType(nodeType, types);
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

      // strip bundler query/hash suffix before passing the id to oxc-parser - oxc infers
      // the parser language from the extension and would otherwise see e.g. `tsx?import`
      // and reject the TypeScript syntax silently
      const queryStart = id.search(/[#?]/);
      const cleanId = queryStart === -1 ? id : id.slice(0, queryStart);
      // CJS files (.cjs, .cts) and files that look like CommonJS get 'require' style by default
      const isCJSFile = /\.c[jt]s$/.test(cleanId);
      // strip a leading BOM before parsing AND from the MagicString source - oxc rejects
      // BOM-prefixed shebangs, and offsetting positions by 1 would corrupt every transform.
      // the BOM is re-prepended to the final output. Reassign `code` so the rest of the
      // function (TransformQueue, skipGap, slice helpers, ...) uses the BOM-stripped source.
      const hasBOM = code.charCodeAt(0) === 0xFEFF;
      if (hasBOM) code = code.slice(1);
      // parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const { program: ast, comments, errors } = parseSync(cleanId, code, {
        sourceType: isCJSFile ? 'script' : 'module',
      });
      const fatalErrors = errors?.filter(e => e.severity === 'Error');
      if (fatalErrors?.length) {
        // surface the parse failure rather than silently passing the file through -
        // bundlers will re-parse and fail, but the warning identifies core-js as the
        // first thing that saw the issue and helps users locate the source location
        const [first] = fatalErrors;
        const message = `[core-js] could not parse ${ id }: ${ first.message }`;
        if (typeof this?.warn === 'function') this.warn(message);
        return null;
      }

      // detect CJS by content for files where extension alone is ambiguous (.js / .ts).
      // ESM markers (import/export at top level) take precedence - a file with both is ESM
      // and the user's `module.exports` will fail at runtime, which is the user's bug.
      const detectedCJS = !isCJSFile && detectCommonJS(ast);
      const importStyle = importStyleOption ?? ((isCJSFile || detectedCJS) ? 'require' : 'import');

      // check disable directives - `disable-file` only counts if it lives above any code
      const offsetToLine = buildOffsetToLine(code);
      const disabledLines = parseDisableDirectives(comments, offsetToLine, ast.body[0]?.start);
      if (disabledLines === true) return null; // entire file disabled

      function isDisabled(node) {
        if (!disabledLines) return false;
        if (node.start === undefined) return false;
        return disabledLines.has(offsetToLine(node.start));
      }

      const ms = new MagicString(code, { filename: id });
      const injector = new ImportInjector({
        ms, pkg, mode, absoluteImports, importStyle,
        directiveEnd: directivePrologueEnd(ast),
      });
      // seed the injector with every binding name in the file (any nesting level)
      // so generated UIDs don't shadow user-declared identifiers in nested scopes
      injector.seedReservedNames(collectAllBindingNames(ast));

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
        const out = ms.toString();
        return {
          code: hasBOM ? `\uFEFF${ out }` : out,
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

      // resolve `super.X` to a static meta on the parent class - returns null for computed
      // keys, instance methods, non-identifier extends, or locally-shadowed parent
      function resolveSuperMember(path) {
        const { node } = path;
        if (node.computed) return null;
        const key = node.property?.name;
        if (!key) return null;
        let methodPath = null;
        let isStatic = false;
        for (let cur = path.parentPath; cur; cur = cur.parentPath) {
          const ct = cur.node?.type;
          if (ct === 'MethodDefinition' || ct === 'PropertyDefinition') {
            methodPath = cur;
            isStatic = !!cur.node.static;
            break;
          }
          // static initializer block is always static
          if (ct === 'StaticBlock') {
            methodPath = cur;
            isStatic = true;
            break;
          }
        }
        if (!methodPath || !isStatic) return null;
        return buildSuperStaticMeta(methodPath.parentPath?.parentPath?.node, key,
          name => !!path.scope?.getBinding?.(name));
      }

      // usage-global mode
      if (method === 'usage-global') {
        const usageGlobalCallback = createUsageGlobalCallback({
          resolveUsage, injectModulesForModeEntry, isDisabled, resolveSuperMember,
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
            // walk up; on each step `prev` is the immediate child path of `p`. ES spec:
            // parameter expressions live in their own scope and CANNOT see `var` declarations
            // from the function body, so if the polyfill is inside the params (default value,
            // computed destructuring key, etc.), the enclosing function is skipped and the
            // `_ref` declaration ends up in the next outer scope.
            for (let prev = metaPath, p = metaPath.parentPath; p; prev = p, p = p.parentPath) {
              const { type, body, params } = p.node;
              if (params?.includes(prev.node)) continue;
              if (type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') {
                this.arrow ??= body;
                continue;
              }
              if (type === 'StaticBlock') {
                // skip past `static` + comments/whitespace so `static /*{*/ {` doesn't fool us
                this.scope = skipGap(code, p.node.start + 'static'.length);
                return;
              }
              if (body?.type === 'BlockStatement' && (type === 'FunctionDeclaration'
                || type === 'FunctionExpression' || type === 'ArrowFunctionExpression')) {
                this.scope = body.start;
                return;
              }
              // TS namespace/module body - Babel treats it as a var-scope boundary; match
              // its behavior so `_ref` lands inside the module instead of at file scope
              if (type === 'TSModuleDeclaration' && body?.type === 'TSModuleBlock') {
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

        // peel ParenthesizedExpression chain to reach the inner AST node (returns the node itself)
        function peelParens(node) {
          while (node?.type === 'ParenthesizedExpression') node = node.expression;
          return node;
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
              while (p + 1 < src.length && !(src[p] === '*' && src[p + 1] === '/')) p++;
              // only advance past `*/` if the loop actually found it; otherwise clamp at EOF
              // so subsequent reads don't run past `src.length` on unterminated block comments
              if (p + 1 < src.length) p += 2;
              else return src.length;
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
            return { root: unwrapParens(rootNode), rootRaw: nodeSrc(rootNode), deoptPositions, rootNode };
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
              // ASI safety: place `null` first so the replacement starts with the `null`
              // keyword (not `(`). Otherwise an unterminated previous statement like
              // `console.log('A')\n(...)?.at(0)` would be parsed as `console.log('A')(...)`.
              guard = `null == (${ guardRef } = ${ optionalRoot }) ? void 0 : `;
              bodyObj = guardRef + bodyObj.slice(strip(rootRaw).length);
            }
          }

          let result;
          if (isNew) {
            // new arr.at(0) -> new (_at(arr))(0) - preserve user's `new` on the polyfill callee
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
          let { root, rootRaw, deoptPositions, rootNode } = findChainRoot(node);
          if (root) {
            const start = isCall ? parent.start : node.start;
            const end = isCall ? parent.end : node.end;
            // dedup against AST node identity, not source text - same `obj` text in two scopes
            // would otherwise share a guard slot incorrectly
            if (node.optional ? transforms.hasGuardFor(start, end, rootNode) : transforms.containsRange(start, end)) {
              root = null;
            }
          }
          return { optionalRoot: root, rootRaw, deoptPositions, rootNode };
        }

        // slice the original source between a call expression's parentheses, preserving
        // every byte (comments, whitespace, even empty arglist content)
        // returns null if we can't locate the parens for some reason
        function sliceBetweenParens(callNode) {
          if (callNode.callee?.end === undefined || callNode.end === undefined) return null;
          // closing `)` is the last char of the call expression range
          const closeParen = callNode.end - 1;
          if (code[closeParen] !== ')') return null;
          // skip any `?.` between the callee and `(` (OptionalCallExpression: `foo?.()`),
          // plus whitespace and comments on either side of it
          const openParen = skipGap(code, afterOptional(callNode.callee.end, false));
          if (code[openParen] !== '(') return null;
          return code.slice(openParen + 1, closeParen);
        }

        // does guard ternary need () to preserve correct precedence?
        function guardNeedsParens(metaPath, isCall, start, end) {
          let outer = (isCall ? metaPath.parentPath : metaPath)?.parentPath;
          if (outer?.node?.type === 'ChainExpression') outer = outer.parentPath;
          // higher-precedence operator parent
          if (NEEDS_GUARD_PARENS.has(outer?.node?.type)) return true;
          // ternary test position: guard ternary merges with outer ternary
          if (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === end) return true;
          // ?. continuation after this range (top-level only - inner transforms get composed)
          // skipGap handles whitespace/comments between the expression end and ?.
          const p = skipGap(code, end);
          return code[p] === '?' && code[p + 1] === '.' && !transforms.containsRange(start, end);
        }

        // build replacement, wrap guard if needed, add to transform queue
        // replacementIsCall overrides isCall for buildReplacement (used by Symbol.iterator:
        // the parent range is the call, but the replacement is a simple call, not .call())
        function addInstanceTransform(binding, node, parent, metaPath, isCall, replacementIsCall = isCall) {
          const objectSrc = unwrapParens(node.object);
          const isNonIdent = !NO_REF_NEEDED.has(unwrapNodeForMemoize(node.object).type);
          const { optionalRoot, rootRaw, deoptPositions, rootNode } = resolveOptionalRoot(node, parent, isCall);
          // preserve comments inside the call's parens by slicing from just after the
          // opening `(` to just before the closing `)`. The previous slice from arg[0].start
          // to arg[-1].end dropped leading/trailing comments and any comment in an empty
          // arglist (`arr.flat(/* hint */)`)
          const argsSrc = isCall ? sliceBetweenParens(parent) : null;
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
          transforms.add(start, end, replacement, optionalRoot ? rootNode : null);
          if (isCall) skippedNodes.add(parent);
          skipProxyGlobal(node);
        }

        // peel parens, chain expressions, AND TS wrappers - for AST identity checks
        // (e.g. matching `node` against `parent.callee` through `arr.includes!(1)`)
        function unwrapNode(n) {
          while (n && (n.type === 'ParenthesizedExpression' || n.type === 'ChainExpression'
            || TS_EXPR_WRAPPERS.has(n.type))) n = n.expression;
          return n;
        }

        // peel parens / chain expressions only - kept separate from `unwrapNode` so
        // memoization decisions stay aligned with babel's `isSafeToReuse`
        function unwrapNodeForMemoize(n) {
          while (n && (n.type === 'ParenthesizedExpression' || n.type === 'ChainExpression')) n = n.expression;
          return n;
        }

        // check if parent is a call/new expression with node as callee
        function isCallee(node, parent) {
          if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return false;
          return unwrapNode(parent.callee) === node;
        }

        function handleSymbolIterator(meta, node, parent, metaPath) {
          const isCallParent = isCallee(node, parent);
          // get-iterator returns the materialized iterator; get-iterator-method returns the method
          // use get-iterator only for plain CallExpression with no args - never for NewExpression
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

        // IIFE / parameter destructure: `function({ from }) {}` -> `function({ from = _Array$from }) {}`
        // only static/global polyfills fit in a default value; instance methods need a receiver
        // LIMITATION: the default only fires when `arg[key] === undefined`, so a present-but-buggy
        // native (e.g. `Array.from` failing SAFE_ITERATION_CLOSING) bypasses the polyfill
        function handleParameterDestructurePure(meta, metaPath, propNode) {
          const { value } = propNode;
          if (value?.type !== 'Identifier') return;
          const pureResult = resolvePure(meta, metaPath);
          if (!pureResult || pureResult.kind === 'instance') return;
          const binding = injectPureImport(pureResult.entry, pureResult.hintName);
          // insert ` = <binding>` after the value identifier - pure insertion, not a replacement,
          // so use ms.appendRight directly rather than the transform queue (which expects overwrites)
          ms.appendRight(value.end, ` = ${ binding }`);
        }

        function handleDestructuringPure(meta, metaPath, propNode) {
          // IIFE / parameter destructure: ObjectPattern's parent is a function
          const patternParentType = metaPath.parentPath?.parentPath?.node?.type;
          if (patternParentType === 'FunctionDeclaration'
            || patternParentType === 'FunctionExpression'
            || patternParentType === 'ArrowFunctionExpression') {
            return handleParameterDestructurePure(meta, metaPath, propNode);
          }
          if (!canTransformDestructuring(metaPath)) return;
          const { value } = propNode;
          // rebuilder only supports bare Identifier or `Identifier = default` locals
          if (value && value.type !== 'Identifier'
            && !(value.type === 'AssignmentPattern' && value.left?.type === 'Identifier')) return;
          const pureResult = resolvePure(meta, metaPath);
          if (!pureResult) return;
          const { entry: importEntry, kind, hintName } = pureResult;
          const binding = injectPureImport(importEntry, hintName);

          const objectPattern = metaPath.parent;
          const isDefault = value?.type === 'AssignmentPattern';
          const localName = isDefault ? value.left.name : value?.name;
          const defaultSrc = isDefault ? nodeSrc(value.right) : null;
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
              // peel `(...)` so `const { resolve } = (Promise)` resolves like the bare form
              initIdentName: peelParens(initNode)?.type === 'Identifier' ? peelParens(initNode).name : null,
              scopeSnapshot: { scope: state.scope, arrow: state.arrow },
            });
            // prevent unused global import for the init identifier - destructuring rewrites
            // properties to polyfill imports directly; if anything remains the rebuilder
            // re-injects the init lazily. skip both the wrapper and inner so the Identifier
            // visitor inside `(Promise)` doesn't queue a stray transform
            if (initNode) {
              skippedNodes.add(initNode);
              const inner = peelParens(initNode);
              if (inner && inner !== initNode) skippedNodes.add(inner);
            }
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

            function propKeySource(p) {
              return p.computed ? `[${ nodeSrc(p.key) }]` : nodeSrc(p.key);
            }

            function emitPolyfilled(info, parts) {
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
              // (init was skipped during collection to prevent unused imports - re-inject lazily)
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

            const parts = [];
            if (isAssignment) {
              for (const info of infos) emitPolyfilled(info, parts);
            } else {
              // interleave polyfilled and untouched declarators in source order
              const polyfilledByDecl = new Map(infos.map(i => [i.declaratorPath.node, i]));
              for (const dec of declPath.node.declarations) {
                const info = polyfilledByDecl.get(dec);
                if (info) emitPolyfilled(info, parts);
                else parts.push(`${ stmtPrefix }${ nodeSrc(dec) }`);
              }
            }

            if (isForInit) {
              transforms.add(replaceNode.start, replaceNode.end, `${ keyword }${ parts.join(', ') }`);
            } else {
              transforms.add(replaceNode.start, replaceNode.end, `${ parts.join(';\n') };`);
            }
          }
        }

        // member key as a string for simple shapes (`at`, `'at'`, `` `at` ``); otherwise null
        function classMemberKeyName(m) {
          if (!m.key) return null;
          if (!m.computed && m.key.type === 'Identifier') return m.key.name;
          if (m.key.type === 'Literal' && typeof m.key.value === 'string') return m.key.value;
          if (m.key.type === 'TemplateLiteral' && m.key.expressions.length === 0 && m.key.quasis.length === 1) {
            return m.key.quasis[0].value.cooked;
          }
          return null;
        }

        // skip `this.X` when the enclosing class shadows X. static methods and nested
        // non-arrow functions short-circuit (their `this` isn't the class instance).
        // ESTree wraps method bodies in FunctionExpression on `MethodDefinition.value`,
        // so that one specific wrapper is ignored when checking for nested functions
        function isShadowedByClassOwnMember(metaPath, key) {
          if (typeof key !== 'string') return false;
          let methodPath = null;
          for (let p = metaPath.parentPath; p; p = p.parentPath) {
            const t = p.node?.type;
            if (t === 'MethodDefinition' || t === 'PropertyDefinition' || t === 'AccessorProperty') {
              methodPath = p;
              break;
            }
            if (t === 'FunctionExpression' || t === 'FunctionDeclaration') {
              const parentType = p.parentPath?.node?.type;
              if (parentType !== 'MethodDefinition') return false;
            }
          }
          if (!methodPath) return false;
          if (methodPath.node.static) return true;
          const classBody = methodPath.parentPath;
          if (classBody?.node?.type !== 'ClassBody') return false;
          return classBody.node.body.some(m => (m.type === 'MethodDefinition' || m.type === 'PropertyDefinition'
            || m.type === 'AccessorProperty')
            && !m.static && classMemberKeyName(m) === key);
        }

        // memoized ancestor walk - cached on parent nodes so descendants share results
        // (overall O(node count) instead of O(node count * depth))
        const typeAnnotationCache = new WeakMap();
        function isInTypeAnnotation(path) {
          const visited = [];
          for (let current = path.parentPath; current; current = current.parentPath) {
            const { node } = current;
            if (!node) break;
            if (typeAnnotationCache.has(node)) {
              const cached = typeAnnotationCache.get(node);
              for (const n of visited) typeAnnotationCache.set(n, cached);
              return cached;
            }
            if (isTypeAnnotationNodeType(node.type)) {
              typeAnnotationCache.set(node, true);
              for (const n of visited) typeAnnotationCache.set(n, true);
              return true;
            }
            visited.push(node);
          }
          for (const n of visited) typeAnnotationCache.set(n, false);
          return false;
        }

        function handleInExpression(meta, metaPath) {
          const { node } = metaPath;
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
        }

        const usagePureCallback = (meta, metaPath) => {
          if (isDisabled(metaPath.node)) return;
          if (skippedNodes.has(metaPath.node)) return;
          if (isInTypeAnnotation(metaPath)) return;
          state.setScope(metaPath);
          const { node } = metaPath;
          // walk past parens, chain expressions, and TS wrappers - they all forward to
          // whatever wraps them, so the semantic parent is past them
          let { parentPath } = metaPath;
          while (parentPath?.node && (parentPath.node.type === 'ParenthesizedExpression'
            || parentPath.node.type === 'ChainExpression'
            || TS_EXPR_WRAPPERS.has(parentPath.node.type))) {
            parentPath = parentPath.parentPath;
          }
          const parent = parentPath?.node;

          if (meta.kind === 'in') return handleInExpression(meta, metaPath);

          // delete check (ChainExpression and ParenthesizedExpression already unwrapped above)
          if (parent?.type === 'UnaryExpression' && parent.operator === 'delete') return;

          if (meta.kind === 'property') {
            if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
              return handleDestructuringPure(meta, metaPath, node);
            }
            if (node.type !== 'MemberExpression') return;
            if (parent?.type === 'UpdateExpression') return;
            if (node.object?.type === 'Super') {
              const superMeta = resolveSuperMember(metaPath);
              if (!superMeta) return;
              meta = superMeta;
            }
            if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
            // `this.X` inside a class that defines its own `X` member - polyfill would
            // bypass the user's override (also bails inside static methods, where `this`
            // is the constructor, not an instance)
            if (node.object?.type === 'ThisExpression' && isShadowedByClassOwnMember(metaPath, meta.key)) return;
            // skip instance method used as tagged template tag - replacing callee breaks `this` binding
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
            // oxc emits two Identifier nodes (key + value, or local + exported) sharing the
            // same source range for shorthand `{ Promise }` and bare `export { Promise }` -
            // expand the rewrite so the public name stays
            const directParent = metaPath.parent;
            if (node.type === 'Identifier' && directParent?.type === 'Property' && directParent.shorthand
              && directParent.value === node && metaPath.parentPath?.parent?.type === 'ObjectExpression') {
              transforms.add(node.start, node.end, `${ node.name }: ${ binding }`);
              return;
            }
            if (node.type === 'Identifier' && directParent?.type === 'ExportSpecifier'
              && directParent.local === node && directParent.exported?.start === node.start
              && directParent.exported?.end === node.end) {
              transforms.add(node.start, node.end, `${ binding } as ${ node.name }`);
              return;
            }
            // deoptionalize `?.` when replacing global/static callee - the polyfill import is always
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
