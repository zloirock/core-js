import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import {
  buildOffsetToLine,
  createClassHelpers,
  createTypeAnnotationChecker,
  detectCommonJS,
  globalProxyMemberName,
  hasTopLevelESM,
  isCoreJSFile,
  isDeleteTarget,
  isForXWriteTarget,
  isTaggedTemplateTag,
  isUpdateTarget,
  mayHaveSideEffects,
  mergeVisitors,
  parseDisableDirectives,
  resolveSuperImportName,
  stripQueryHash,
  TS_EXPR_WRAPPERS,
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
  scanExistingCoreJSImports,
} from '@core-js/polyfill-provider/detect-usage';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue from './transform-queue.js';
import detectEntries, { removeTopLevelStatement } from './detect-entry.js';
import { estreeAdapter, createUsageVisitors, createSyntaxVisitors } from './detect-usage.js';
import {
  canFuseWithOpenParen,
  collectAllBindingNames,
  directivePrologueEnd,
  hasCoreJSPureImport,
  isBodylessStatementBody,
  isDirectiveStatement,
  KNOWN_BUNDLERS,
  LINE_TERMINATOR,
  NEEDS_GUARD_PARENS,
  NO_REF_NEEDED,
  startsEnclosingStatement,
} from './plugin-helpers.js';
import SnapshotCache from './snapshot-cache.js';

export { collectAllBindingNames } from './plugin-helpers.js';

// estree-toolkit's scope crawler doesn't recognise `TSDeclareFunction` as a scope owner, so
// it walks into `RestElement` in params via the reference path which throws `This should be
// handled by findVisiblePathsInPattern`. narrow retype: only when params contain `RestElement`
// (the sole crash trigger) - touching every declare would flip `es.function.name` injection
// on user-facing identifiers. params are preserved so `Parameters<typeof fn>[N]` keeps working
function neutralizeTSDeclareFunctions(ast) {
  if (!ast?.body) return;
  for (const stmt of ast.body) {
    const target = unwrapExport(stmt);
    if (target?.type !== 'TSDeclareFunction') continue;
    if (!target.params?.some(p => p?.type === 'RestElement')) continue;
    target.type = 'FunctionDeclaration';
    target.body = { type: 'BlockStatement', body: [], start: target.end, end: target.end };
  }
}

// `export declare function …` / `export default declare function …` wrap the declaration
function unwrapExport(stmt) {
  return stmt?.type === 'ExportNamedDeclaration' || stmt?.type === 'ExportDefaultDeclaration'
    ? stmt.declaration : stmt;
}

export default function createPlugin(options) {
  // per-instance type resolvers - guardsCache/resolveCache WeakMaps don't leak across plugin instances
  const typeResolvers = createResolveNodeType(nodeType, types);

  // upstream unplugin's framework union drifts - unknown values degrade to generic handling
  // (`isWebpack = false`) instead of hard-crashing every transform
  const { bundler, ...providerOptions } = options;
  if (bundler !== undefined && bundler !== null && !KNOWN_BUNDLERS.has(bundler)) {
    const list = [...KNOWN_BUNDLERS].map(b => `'${ b }'`).join(', ');
    // eslint-disable-next-line no-console -- first-run diagnostic
    console.warn(`[core-js-unplugin] unknown \`bundler\` ${ JSON.stringify(bundler) } - falling back to generic handling (expected one of ${ list })`);
  }

  const snapshots = new SnapshotCache({ debug: !!providerOptions.debug });
  const { resolver, createDebugOutput } = createPolyfillResolver(providerOptions, {
    typeResolvers,
    astPredicates: {
      isMemberLike: path => path.node?.type === 'MemberExpression',
      isCallee: (node, parent) => {
        if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return false;
        let { callee } = parent;
        while (callee?.type === 'ParenthesizedExpression') callee = callee.expression;
        return callee === node;
      },
      isSpreadElement: node => node?.type === 'SpreadElement',
    },
  });

  const { method, absoluteImports, importStyle: importStyleOption } = providerOptions;
  const {
    mode, pkg, packages, getModulesForEntry, getCoreJSEntry, isEntryNeeded,
    resolveUsage, resolvePure, resolvePureOrGlobalFallback,
  } = resolver;
  const isWebpack = bundler === 'webpack' || bundler === 'rspack';

  // eslint-disable-next-line max-statements -- ok
  function runTransform(code, id, pass = 'single') {
    // defensive guard for direct callers (bundlers always pass valid strings)
    if (typeof code !== 'string' || typeof id !== 'string') return null;
    if (isCoreJSFile(id)) return null;
    // per-file reset of AST-keyed caches: WeakMap would GC eventually, this makes the
    // memory bound explicit under long-running dev-server / HMR. `createClassHelpers`
    // is created fresh per transform below; only the persistent resolver needs clearing
    typeResolvers.reset();
    // entry-global resolves `import 'core-js'` once per file; neither defer-imports nor
    // snapshot inheritance apply. wrapper only dispatches pass='single' for this method,
    // but defensively pin it here so direct callers (tests, bespoke integrations) can't
    // end up with an empty output from `deferImports=true` suppressing resolution.
    if (method === 'entry-global') pass = 'single';
    const deferImports = pass === 'pre';
    let inherit = null;
    let cachedAst = null;
    let cachedComments = null;

    // strip bundler query/hash suffix before passing the id to oxc-parser - oxc infers
    // the parser language from the extension and would otherwise see e.g. `tsx?import`
    // and reject the TypeScript syntax silently
    const cleanId = stripQueryHash(id);
    // CJS files (.cjs, .cts) and files that look like CommonJS get 'require' style by default
    const isCJSFile = /\.c[jt]s$/.test(cleanId);
    // strip a leading BOM before parsing AND from the MagicString source - oxc rejects
    // BOM-prefixed shebangs, and offsetting positions by 1 would corrupt every transform.
    // the BOM is re-prepended to the final output. Reassign `code` so the rest of the
    // function (TransformQueue, skipGap, slice helpers, ...) AND the post-pass cache
    // comparison use the BOM-stripped source (stored `postInput` is always BOM-stripped)
    const hasBOM = code.charCodeAt(0) === 0xFEFF;
    if (hasBOM) code = code.slice(1);

    // read + clear snapshot up-front so a later parse/traverse error in post still frees
    // the entry (otherwise a one-off failure leaks until the next buildEnd reset)
    if (pass === 'post') {
      const stored = snapshots.take(id);
      if (stored) {
        inherit = stored.snapshot;
        // sibling may have mutated pre's output between passes; only reuse the parse
        // when the source bytes match what pre handed off (null for modes that rewrite)
        if (stored.ast && stored.postInput === code) {
          cachedAst = stored.ast;
          cachedComments = stored.comments;
        }
      }
    }
    let ast;
    let comments;
    if (cachedAst) {
      ast = cachedAst;
      comments = cachedComments;
    } else {
      // parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const parsed = parseSync(cleanId, code, { sourceType: isCJSFile ? 'script' : 'module' });
      const fatalErrors = parsed.errors?.filter(e => e.severity === 'Error');
      if (fatalErrors?.length) {
        // surface the parse failure rather than silently passing the file through -
        // bundlers will re-parse and fail, but the warning identifies core-js as the
        // first thing that saw the issue and helps users locate the source location
        const [first] = fatalErrors;
        const message = `[core-js] could not parse ${ id }: ${ first.message }`;
        if (typeof this?.warn === 'function') this.warn(message);
        return null;
      }
      ast = parsed.program;
      comments = parsed.comments;
    }

    // estree-toolkit's scope crawler doesn't recognize `TSDeclareFunction` as a scope owner,
    // so it falls through to the reference-walker which throws on `RestElement` in params
    // (`This should be handled by findVisiblePathsInPattern`). retype to `FunctionDeclaration`
    // with an empty body - same shape (id / params / async / generator), scope walker handles
    // it as a regular fn, `resolveParametersParams` still reads params for `Parameters<typeof fn>[N]`
    neutralizeTSDeclareFunctions(ast);

    // source wins over extension: a `.cjs`/`.cts` with top-level ESM (oxc parses tolerantly)
    // must emit `import`, or bundlers reject the mixed output
    const importStyle = importStyleOption
      ?? (!hasTopLevelESM(ast) && (isCJSFile || detectCommonJS(ast)) ? 'require' : 'import');

    // check disable directives - `disable-file` only counts if it lives above any code.
    // a `'use strict'` prologue can precede `disable-file`, so skip directives before the cutoff
    const offsetToLine = buildOffsetToLine(code);
    const firstNonDirective = ast.body.find(s => !isDirectiveStatement(s));
    const disabledLines = parseDisableDirectives(comments, offsetToLine, firstNonDirective?.start, ast);
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
      deferImports,
      inherit,
    });
    // single AST scan - `names` seeds UID-collision guards at every nesting level;
    // `orphanRefs` feeds orphan adoption when post runs without a prior pre snapshot
    // (sibling-plugin invalidation between passes); filter out user-owned `let _ref` via `names`
    const { names: bindingNames, orphanRefs } = collectAllBindingNames(ast);
    injector.seedReservedNames(bindingNames);
    // gate on pre-output fingerprint - direct post calls without a prior pre shouldn't
    // adopt coincidental user-source `_ref = ...` as if they were leftover from our pipeline
    if (pass === 'post' && !inherit && hasCoreJSPureImport(ast, packages)) {
      const adoptable = new Set();
      for (const ref of orphanRefs) if (!bindingNames.has(ref)) adoptable.add(ref);
      injector.adoptOrphanRefs(adoptable);
    }
    // post WITH inherit already has user imports dedup'd via the pre-pass snapshot;
    // post WITHOUT inherit (single `phase: 'post'` or dropped snapshot) still needs to
    // scan so user `import 'core-js/…'` isn't duplicated alongside plugin-injected ones.
    // entry-global handles re-emit via detectEntries
    if (!(pass === 'post' && inherit) && method !== 'entry-global') {
      const removed = new Set();
      scanExistingCoreJSImports(ast, {
        adapter: estreeAdapter,
        mode,
        // `addGlobalImport`, not `registerUserGlobalImport` - source is about to be removed,
        // so the dedup filter must not suppress re-emit
        onGlobalImport: (mod, node) => {
          injector.addGlobalImport(mod);
          removed.add(node);
        },
        onPureImport: (entry, name) => injector.registerUserPureImport(entry, name),
        packages,
        pkg,
      });
      if (removed.size) {
        // splice from AST too - `await import(...)` would otherwise drag Promise polyfills
        // via the syntax visitor after its statement is gone from output
        ast.body = ast.body.filter(n => !removed.has(n));
        for (const node of removed) removeTopLevelStatement(ms, node);
      }
    }
    // post drops inherited pure imports whose binding isn't referenced - sibling may have
    // deleted the usage between pre and post
    if (pass === 'post' && inherit) injector.enableReferenceTracking();

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
      if (pass === 'pre') {
        // reuse the parse in post only when pre didn't rewrite the source (usage-global
        // leaves `code` untouched; usage-pure mutates via TransformQueue so positions
        // in its AST no longer line up with what post receives)
        const canReuseParse = !ms.hasChanged();
        snapshots.store(id, {
          snapshot: injector.snapshot(),
          ast: canReuseParse ? ast : null,
          comments: canReuseParse ? comments : null,
          postInput: canReuseParse ? code : null,
        });
      }
      // post's snapshot delete happens at the top of runTransform so it runs even on
      // early-return paths (parse error, isCoreJSFile, disabled directive)
      if (!ms.hasChanged()) return null;
      const out = ms.toString();
      return {
        code: hasBOM ? `\uFEFF${ out }` : out,
        // in `post` pass `ms.original` is pre-pass output, not the real source - omit
        // sourcesContent so the bundler chains through pre-pass map's content instead
        // of attributing pre-output as the claimed content of `id`
        map: ms.generateMap({ source: id, includeContent: pass !== 'post', hires: 'boundary' }),
      };
    }

    // entry-global mode: replace `import 'core-js'` with resolved modules
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

    const { resolveSuperMember, isShadowedByClassOwnMember } = createClassHelpers(types, estreeAdapter);

    // usage-global mode
    if (method === 'usage-global') {
      const usageGlobalCallback = createUsageGlobalCallback({
        resolveUsage, injectModulesForModeEntry, isDisabled, resolveSuperMember,
      });

      const usageVisitors = createUsageVisitors({
        onUsage: usageGlobalCallback,
        onWarning: msg => debugOutput?.warn(msg),
      });
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

      // cache setScope walk-up result per leaf node - each node's enclosing scope is
      // fixed by its position in the AST, so the walk is purely a function of the node
      const scopeCache = new WeakMap();

      // per-callback mutable state + deferred collections
      // setScope() runs before each callback; genRef() reads the current scope
      const state = {
        scope: -1, // insertion position for `var _ref;` inside enclosing block (-1 = file scope)
        arrow: null, // innermost arrow expression body node needing block conversion
        scopedVars: new Map(), // insertionPos -> [var names]
        arrowVars: new Map(), // arrow body node -> [var names]
        destructuring: new Map(), // ObjectPattern node -> destructuring info
        // advance past `{` and any directive prologue (`"use strict"`, etc.) so that
        // inserted `var _ref;` does not split the directive off from being first in body
        // and silently flip the function to sloppy mode
        skipDirectives(statements, startPos) {
          let end = startPos;
          for (const stmt of statements ?? []) {
            if (stmt.type !== 'ExpressionStatement' || typeof stmt.directive !== 'string') break;
            end = stmt.end;
          }
          return end;
        },
        setScope(metaPath) {
          const cached = scopeCache.get(metaPath.node);
          if (cached) {
            this.scope = cached.scope;
            this.arrow = cached.arrow;
            return;
          }
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
            const anchor = varScopeAnchor(p.node);
            if (anchor) {
              this.scope = this.skipDirectives(anchor.statements, anchor.insertPos);
              break;
            }
          }
          scopeCache.set(metaPath.node, { scope: this.scope, arrow: this.arrow });
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
          // insert var declarations at each computed insertion point (after `{` + any
          // directive prologue - see setScope.skipDirectives)
          for (const [insertPos, names] of this.scopedVars) {
            ms.appendRight(insertPos, `\nvar ${ names.join(', ') };`);
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

      // scan forward from `pos` in `src`, skipping whitespace and comments, until a non-gap char.
      // `\s` covers the ES spec's WhiteSpace + LineTerminator sets (including U+2028/U+2029,
      // NBSP, mid-file BOM, ogham/Mongolian separators) - engines treat all of them as gaps
      function skipGap(src, pos) {
        let p = pos;
        while (p < src.length) {
          const ch = src[p];
          if (/\s/.test(ch)) {
            p++;
            continue;
          }
          if (ch === '/' && src[p + 1] === '/') {
            // line comments terminate on any JS LineTerminator (LF/CR/U+2028/U+2029)
            while (p < src.length && !LINE_TERMINATOR.test(src[p])) p++;
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

      // anchor for `var _ref;` as { statements, insertPos }, or null. `var` hoists to the
      // enclosing function regardless of placement, so we pick the innermost braced block
      // (any BlockStatement, including function bodies) to match Babel's codegen cosmetics
      function varScopeAnchor(node) {
        const { type, body } = node;
        if (type === 'StaticBlock') {
          // `static /*{*/ {` -> skip past `static` + any gap before `{`
          return { statements: body, insertPos: skipGap(code, node.start + 'static'.length) + 1 };
        }
        if (type === 'BlockStatement') return { statements: node.body, insertPos: node.start + 1 };
        if (type === 'TSModuleDeclaration' && body?.type === 'TSModuleBlock') {
          return { statements: body.body, insertPos: body.start + 1 };
        }
        return null;
      }

      // strip `?.` at known absolute positions within a source slice
      // positions are absolute offsets in the original source (object end); baseOffset maps to slice start
      // scans forward from position to find the `?.` token (skipping whitespace/comments)
      function stripOptionalDots(src, baseOffset, positions) {
        if (!positions?.length) return src;
        // findChainRoot collects positions outermost-first (descending); sort ascending for left-to-right slicing
        const sorted = [...positions].sort((a, b) => a - b);
        let result = '';
        let prev = 0;
        for (const absPos of sorted) {
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

      // walk the chain to find the first non-polyfillable optional,
      // skipping TS expression wrappers (TSAsExpression, TSNonNullExpression, etc.)
      function findChainRoot(node) {
        function chainChild(n) {
          return n.object || n.callee || (TS_EXPR_WRAPPERS.has(n.type) ? n.expression : null);
        }
        function makeResult(optionalNode) {
          const rootNode = optionalNode.object || optionalNode.callee;
          const deoptPositions = [];
          let cur = chainChild(node);
          while (cur && typeof cur === 'object') {
            if (cur.optional) deoptPositions.push(cur.object?.end ?? cur.callee?.end);
            if (cur === optionalNode) break;
            cur = chainChild(cur);
          }
          return { root: unwrapParens(rootNode), rootRaw: nodeSrc(rootNode), deoptPositions, rootNode };
        }
        const isPoly = n => isPolyfillableOptional(n, null, estreeAdapter, resolveBuiltIn);
        let current = node.optional ? node : chainChild(node);
        while (current && typeof current === 'object') {
          if (current.optional) {
            return isPoly(current) ? { root: null } : makeResult(current);
          }
          current = chainChild(current);
        }
        return { root: null };
      }

      // build the replacement text for an instance method or Symbol.iterator transform
      function buildReplacement(binding, objectSrc, opts) {
        const {
          isCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
          optionalCall, args, objectStart, preAllocatedGuardRef,
        } = opts;
        const strip = src => stripOptionalDots(src, objectStart ?? 0, deoptPositions);
        let bodyObj = deoptPositions?.length ? strip(objectSrc) : objectSrc;
        let guard = '';
        let guardRef = null;

        if (optionalRoot) {
          if (/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)) {
            guard = `${ optionalRoot } == null ? void 0 : `;
          } else {
            guardRef = preAllocatedGuardRef ?? state.genRef();
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

      // mark a node and its transparent wrappers (parens, ChainExpression, TS wrappers) as skipped
      function skipWrappedNode(node) {
        let cur = node;
        while (cur) {
          skippedNodes.add(cur);
          if (cur.type === 'ParenthesizedExpression' || cur.type === 'ChainExpression'
              || TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
          else break;
        }
      }

      // resolve optional root + skip redundant guard when nested inside an outer transform
      function resolveOptionalRoot(node, parent, isCall) {
        let { root, rootRaw, deoptPositions, rootNode } = findChainRoot(node);
        if (root) {
          const start = isCall ? parent.start : node.start;
          const end = isCall ? parent.end : node.end;
          // dedup by rootNode identity: `x.at(a?.b.at(0))` has outer guard for `x` (none),
          // inner for `a` - skipping inner because it's range-contained would drop the
          // `a == null ? void 0 :` and crash on `a === null`
          if (transforms.hasGuardFor(start, end, rootNode)) root = null;
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
        // peel ChainExpression and TS wrappers - `as X` / `!` / `satisfies Y` are runtime
        // no-ops in the emitted source, so the *real* enclosing operator is the one above
        while (outer?.node && (outer.node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(outer.node.type))) {
          outer = outer.parentPath;
        }
        if (NEEDS_GUARD_PARENS.has(outer?.node?.type)) return true;
        if (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === end) return true;
        // ?. continuation after this range (top-level only - inner transforms get composed)
        const p = skipGap(code, end);
        return code[p] === '?' && code[p + 1] === '.' && !transforms.containsRange(start, end);
      }

      // build replacement, wrap guard if needed, add to transform queue.
      // replacementIsCall overrides isCall for buildReplacement (Symbol.iterator: parent
      // range is the call, but the emitted shape is a simple call, not `.call()`)
      function addInstanceTransform(binding, node, parent, metaPath, isCall, replacementIsCall = isCall) {
        let objectSrc = unwrapParens(node.object);
        let isNonIdent = !NO_REF_NEEDED.has(unwrapNodeForMemoize(node.object).type);
        const { optionalRoot, rootRaw, deoptPositions, rootNode } = resolveOptionalRoot(node, parent, isCall);
        // inner polyfill sharing the chain root with an outer: reuse outer's guardRef so
        // `fn()` is evaluated once (`_at(_ref).call(_ref, 0)`, not `_at(_ref3 = fn())...`)
        if (!optionalRoot && rootNode && node.object === rootNode) {
          const outerRef = transforms.findOuterGuardRef(rootNode);
          if (outerRef) {
            objectSrc = outerRef;
            isNonIdent = false;
          }
        }
        // slice between parens to keep leading/trailing comments and empty-arglist comments
        const argsSrc = isCall ? sliceBetweenParens(parent) : null;
        const start = isCall ? parent.start : node.start;
        const end = isCall ? parent.end : node.end;
        const isNew = parent?.type === 'NewExpression' && isCall;
        // pre-allocate so rewriteHint and buildReplacement agree on the ref name
        const preAllocatedGuardRef = optionalRoot
            && !/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)
            ? state.genRef() : null;

        let replacement = buildReplacement(binding, objectSrc, {
          isCall: replacementIsCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
          optionalCall: isCall && parent.optional, args: argsSrc,
          objectStart: node.object.start,
          preAllocatedGuardRef,
        });
        if (optionalRoot && guardNeedsParens(metaPath, isCall, start, end)) {
          replacement = `(${ replacement })`;
          // when a statement-leading `(...)` replaces an identifier-leading original, the
          // enclosing ExpressionStatement can fuse into the previous one (`foo()\n(...)`
          // parses as `foo()(...)`). only inject `;` at the statement boundary
          if (startsEnclosingStatement(metaPath, start) && canFuseWithOpenParen(code, start)) {
            replacement = `;${ replacement }`;
          }
        }
        // composition hint: outer rewrites `rootRaw -> guardRef` + strips `?.`, so
        // substituteInner can rebuild a matching needle when the raw slice is gone
        const rewriteHint = preAllocatedGuardRef
            ? { rootRaw, guardRef: preAllocatedGuardRef, deoptPositions, objectStart: node.object.start }
            : null;
        transforms.add(start, end, replacement, optionalRoot ? rootNode : null, rewriteHint);
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
        if (node.property) skipWrappedNode(node.property);
      }

      // text-based Babel-style OR-chain (see babel-compat.js replaceInstanceChainCombined)
      function findInnerPolyChain(node, parent, metaPath) {
        if (!isCallee(node, parent) || node.type !== 'MemberExpression' || node.computed) return null;
        let current = node.object;
        while (current && (current.type === 'ParenthesizedExpression'
            || current.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(current.type))) {
          current = current.expression;
        }
        while (current && (current.type === 'MemberExpression' || current.type === 'CallExpression')) {
          if (current.optional) break;
          current = current.type === 'MemberExpression' ? current.object : current.callee;
        }
        if (current?.type !== 'CallExpression' || !current.optional) return null;
        const { callee } = current;
        if (callee?.type !== 'MemberExpression' || callee.computed) return null;
        if (callee.property?.type !== 'Identifier') return null;
        const meta = { kind: 'property', object: null, key: callee.property.name, placement: 'prototype' };
        const { result } = resolvePureOrGlobalFallback(meta, metaPath.get('object').get('callee'));
        if (result?.kind !== 'instance') return null;
        return { chainStart: current, innerCallee: callee, innerResult: result };
      }

      function replaceInstanceChainCombined(outerBinding, node, parent, metaPath, chain) {
        const { chainStart, innerCallee, innerResult } = chain;
        const innerBinding = injectPureImport(innerResult.entry, innerResult.hintName);
        const aRef = state.genRef();
        const mRef = state.genRef();
        const outerRef = state.genRef();
        const innerArgs = sliceBetweenParens(chainStart) ?? '';
        const outerArgs = sliceBetweenParens(parent) ?? '';
        const innerCall = `${ mRef }.call(${ aRef }${ innerArgs ? `, ${ innerArgs }` : '' })`;
        const receiver = unwrapParens(innerCallee.object);

        const tests = [
          `null == (${ aRef } = ${ receiver })`,
          `null == (${ mRef } = ${ innerBinding }(${ aRef }))`,
        ];
        let outerObj;
        // outer is `?.method`: nullish inner value must short-circuit the outer call too
        if (node.optional) {
          tests.push(`null == (${ outerRef } = ${ innerCall })`);
          outerObj = outerRef;
        } else {
          outerObj = `${ outerRef } = ${ innerCall }`;
        }
        const dot = parent.optional ? '?.' : '.';
        const suffix = outerArgs ? `, ${ outerArgs }` : '';
        let replacement = `${ tests.join(' || ') } ? void 0 : ${ outerBinding }(${ outerObj })${ dot }call(${ outerRef }${ suffix })`;
        if (guardNeedsParens(metaPath, true, parent.start, parent.end)) replacement = `(${ replacement })`;

        transforms.add(parent.start, parent.end, replacement);
        skippedNodes.add(innerCallee);
        skippedNodes.add(parent);
        skipProxyGlobal(node);
      }

      function replaceInstance(binding, node, parent, metaPath) {
        // (arr?.includes)(1) - parenthesized optional callee breaks the chain.
        // replace only the member expression (not .call()). non-optional (arr.at)(0) preserves this
        if (isCallee(node, parent) && parent.callee !== node
            && parent.callee?.type === 'ParenthesizedExpression' && node.optional) {
          addInstanceTransform(binding, node, parent, metaPath, false, false);
          return;
        }
        const chain = findInnerPolyChain(node, parent, metaPath);
        if (chain) return replaceInstanceChainCombined(binding, node, parent, metaPath, chain);
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
        // catch ({ includes }) {} - treat like a variable declarator with generated ref
        if (declaratorPath.node.type === 'CatchClause') return true;
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

      // parameter destructure `function({ from = _Array$from })`: the default only fires
      // when `arg[key] === undefined`, so a present-but-buggy native bypasses the polyfill
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
        // two-pass post: skip `{ key: _unusedN, ...rest }` sentinels left by pre -
        // the inherited unusedNames set tracks them so we don't duplicate extraction
        if (propNode.value?.type === 'Identifier'
            && injector.hasGeneratedUnusedName(propNode.value.name)) return;
        if (!canTransformDestructuring(metaPath)) return;
        // `X ?? Array` - runtime value from either branch, unsafe to replace destructuring
        if (meta.fromFallback) return;
        // export + rest: skip - `_unused` rename would pollute the module's export namespace
        const patternHasRest = metaPath.parent?.properties?.some(
          p => p.type === 'RestElement' || p.type === 'SpreadElement');
        if (patternHasRest && metaPath.parentPath?.parentPath?.parentPath?.parentPath?.node?.type
            === 'ExportNamedDeclaration') return;
        // [Symbol.iterator] in destructuring: { [Symbol.iterator]: iter } = obj -> iter = _getIteratorMethod(obj)
        // when rest element is present, the key transform is needed for the rest-rebuild pattern;
        // otherwise skip the key to prevent an unused _Symbol$iterator import
        if (propNode.computed && meta.key === 'Symbol.iterator') {
          const patternProps = metaPath.parent?.properties;
          const hasRest = patternProps?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
          if (!hasRest) {
            skippedNodes.add(propNode.key);
            if (propNode.key.object) skippedNodes.add(propNode.key.object);
          }
        }
        const { value } = propNode;
        // rebuilder only supports bare Identifier or `Identifier = default` locals
        if (value && value.type !== 'Identifier'
            && !(value.type === 'AssignmentPattern' && value.left?.type === 'Identifier')) return;
        // Symbol.iterator: resolve normally fails (not in instance table), use getIteratorMethod
        const isSymbolIterator = propNode.computed && meta.key === 'Symbol.iterator';
        const pureResult = isSymbolIterator ? null : resolvePure(meta, metaPath);
        if (!pureResult && !isSymbolIterator) return;
        const kind = isSymbolIterator ? 'instance' : pureResult.kind;
        const binding = isSymbolIterator
            ? injectPureImport('get-iterator-method', 'getIteratorMethod')
            : injectPureImport(pureResult.entry, pureResult.hintName);

        const objectPattern = metaPath.parent;
        const isDefault = value?.type === 'AssignmentPattern';
        const localName = isDefault ? value.left.name : value?.name;
        const defaultSrc = isDefault ? nodeSrc(value.right) : null;
        if (!localName) return;

        // find statement path:
        // VariableDeclaration: Property -> ObjectPattern -> VariableDeclarator -> VariableDeclaration
        // assignment: Property -> ObjectPattern -> AssignmentExpression -> ExpressionStatement
        // catch clause: Property -> ObjectPattern -> CatchClause
        const declaratorPath = metaPath.parentPath?.parentPath;
        const isCatchClause = declaratorPath?.node?.type === 'CatchClause';
        const isAssignment = !isCatchClause && declaratorPath?.node?.type === 'AssignmentExpression';
        let declPath = isCatchClause ? declaratorPath : declaratorPath?.parentPath;
        // unwrap ParenthesizedExpression for assignment: ({ from } = Array) -> ExpressionStatement
        if (isAssignment) {
          while (declPath?.node?.type === 'ParenthesizedExpression') declPath = declPath.parentPath;
        }
        // get init source for instance methods (catch clause: generated ref replaces param)
        const initNode = isCatchClause ? null
            : isAssignment ? declaratorPath?.node?.right : declaratorPath?.node?.init;
        const initSrc = isCatchClause ? injector.generateRef(false) : initNode ? nodeSrc(initNode) : null;

        if (!state.destructuring.has(objectPattern)) {
          state.destructuring.set(objectPattern, {
            entries: [],
            allProps: objectPattern.properties || [],
            declPath,
            declaratorPath,
            isAssignment,
            isCatchClause,
            initSrc,
            initStart: initNode?.start,
            initEnd: initNode?.end,
            // peel `(...)` so `const { resolve } = (Promise)` resolves like the bare form
            initNode,
            initIdentName: peelParens(initNode)?.type === 'Identifier' ? peelParens(initNode).name : null,
            scopeSnapshot: { scope: state.scope, arrow: state.arrow },
          });
          // mark global identifiers in init so they don't generate conflicting transforms.
          // instance methods (.slice, .at) are NOT marked -- they compose correctly and
          // must be polyfilled since the init expression stays in the output as an argument
          if (initNode && !mayHaveSideEffects(initNode)) {
            const markInitGlobals = node => {
              let cur = node;
              while (cur) {
                switch (cur.type) {
                  case 'LogicalExpression':
                    markInitGlobals(cur.left);
                    cur = cur.right;
                    break;
                  case 'SequenceExpression':
                    for (const expr of cur.expressions) markInitGlobals(expr);
                    cur = null;
                    break;
                  case 'ConditionalExpression':
                    markInitGlobals(cur.consequent);
                    cur = cur.alternate;
                    break;
                  case 'ParenthesizedExpression':
                  case 'ChainExpression':
                    cur = cur.expression;
                    break;
                  case 'CallExpression':
                  case 'OptionalCallExpression':
                  case 'NewExpression':
                  case 'TaggedTemplateExpression':
                    cur = cur.callee || cur.tag;
                    break;
                  case 'MemberExpression':
                  case 'OptionalMemberExpression':
                    // mark proxy-global member chains (globalThis.Promise) but not
                    // instance methods (arr.slice) - instance methods compose correctly
                    if (findProxyGlobal(cur)) skippedNodes.add(cur);
                    cur = cur.object;
                    break;
                  case 'Identifier':
                    skippedNodes.add(cur);
                    cur = null;
                    break;
                  default:
                    cur = TS_EXPR_WRAPPERS.has(cur.type) ? cur.expression : null;
                }
              }
            };
            markInitGlobals(initNode);
          }
        }
        state.destructuring.get(objectPattern).entries.push({ propNode, localName, binding, kind, defaultSrc });
      }

      // catch clause: replace param with ref, insert polyfilled + remaining in source order
      function emitCatchClause(infos, catchNode) {
        const [{ initSrc: ref, allProps }] = infos;
        const entryByProp = new Map(infos.flatMap(i => i.entries.map(e => [e.propNode, e])));
        // extract computed-key transforms to prevent composition conflicts
        for (const e of entryByProp.values()) {
          if (e.propNode.computed) e.polyfillKeyContent = transforms.extractContent(e.propNode.key.start, e.propNode.key.end);
        }
        const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
        const lines = [];
        for (const p of allProps) {
          if (p.type === 'RestElement' || p.type === 'SpreadElement') continue;
          const e = entryByProp.get(p);
          if (!e) {
            // non-polyfillable property - emit individually (unless rest rebuilds the whole pattern)
            if (!hasRest) lines.push(`let { ${ nodeSrc(p) } } = ${ ref };`);
            continue;
          }
          const valueSrc = e.kind === 'instance' ? `${ e.binding }(${ ref })` : e.binding;
          if (e.defaultSrc) {
            const testRef = e.kind === 'instance' ? injector.generateRef(false) : null;
            const test = testRef ? `(${ testRef } = ${ valueSrc })` : valueSrc;
            lines.push(`let ${ testRef ? `${ testRef }, ` : '' }${ e.localName } = ${ test } === void 0 ? ${ e.defaultSrc } : ${ testRef || valueSrc };`);
          } else {
            lines.push(`let ${ e.localName } = ${ valueSrc };`);
          }
        }
        // rest element: rebuild full pattern with polyfilled keys renamed to unused bindings
        if (hasRest) {
          const rebuiltProps = allProps.map(p => {
            const e = entryByProp.get(p);
            if (!e) return nodeSrc(p);
            const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : nodeSrc(p.key);
            return `${ keySrc }: ${ injector.generateUnusedName() }`;
          });
          lines.push(`let { ${ rebuiltProps.join(', ') } } = ${ ref };`);
        }
        transforms.add(catchNode.param.start, catchNode.param.end, ref);
        ms.appendRight(catchNode.body.start + 1, `\n${ lines.join('\n') }`);
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
          const [{ declPath, isAssignment, isCatchClause }] = infos;

          // catch clause: replace param with ref, insert extracted declarations into body
          // `let` preserves block scope; safe to emit since destructuring implies `let` support
          if (isCatchClause) {
            emitCatchClause(infos, declPath.node);
            continue;
          }

          const isExport = !isAssignment && declPath.parentPath?.node?.type === 'ExportNamedDeclaration';
          const isForInit = !isAssignment && declPath.parentPath?.node?.type === 'ForStatement'
              && declPath.parentPath.node.init === declPath.node;
          const replaceNode = isExport ? declPath.parentPath.node : declPath.node;
          const prefix = isExport ? 'export ' : '';
          const keyword = isAssignment ? '' : `${ declPath.node.kind } `;
          // for-init: single comma-separated declaration; otherwise: separate statements
          const stmtPrefix = isForInit ? '' : `${ prefix }${ keyword }`;
          const memoPrefix = isForInit ? '' : 'const ';

          function propKeySource(p) {
            return p.computed ? `[${ nodeSrc(p.key) }]` : nodeSrc(p.key);
          }

          function emitPolyfilled(info, parts, deferredSEs) {
            const { entries, allProps, initSrc, initIdentName, initStart, initEnd, scopeSnapshot } = info;
            // if the init has a queued transform (e.g. Promise -> _Promise), extract it
            // to prevent composition corruption (Promise in _Promise$resolve -> __Promise$resolve)
            let initTransformed = (initStart !== undefined && initEnd !== undefined
                ? transforms.extractContent(initStart, initEnd) : null) ?? initSrc;
              // extract computed-key transforms to prevent composition conflicts (Symbol.iterator -> _Symbol$iterator)
            for (const e of entries) {
              if (e.propNode.computed) e.polyfillKeyContent = transforms.extractContent(e.propNode.key.start, e.propNode.key.end);
            }
            const polyfillKeys = new Set(entries.map(e => e.propNode));
            const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
            const remaining = allProps.filter(p => !polyfillKeys.has(p));
            const hasInstance = entries.some(e => e.kind === 'instance');
            // resolve global name for lazy re-injection: bare (`Promise`) or proxy (`globalThis.Promise`).
            // scope+adapter omitted - unplugin's `state.scope` snapshot exposes a reduced API
            // (no `.getBinding()`) that isn't compatible with `estreeAdapter`; polyfillHint-aliased
            // proxies don't arise in unplugin anyway since it doesn't mutate bindings in place
            const resolvedGlobalName = initIdentName || globalProxyMemberName(peelParens(info.initNode));
            // if remaining/rest/instance needs init object, ensure it's polyfilled
            if ((remaining.length > 0 || hasRest || hasInstance) && initTransformed === initSrc && resolvedGlobalName) {
              const initResolved = resolvePure({ kind: 'global', name: resolvedGlobalName }, null);
              if (initResolved) initTransformed = injectPureImport(initResolved.entry, initResolved.hintName);
            }
            const needsMemo = hasInstance && !resolvedGlobalName && (entries.length > 1 || remaining.length > 0 || hasRest);
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

            // preserve side-effects when init is fully dropped (all-static, no rest/remaining)
            if (!hasInstance && !hasRest && remaining.length === 0 && initSrc
                && mayHaveSideEffects(info.initNode)) {
              // collect in source order - prepended to parts after the declarator loop
              deferredSEs.push(isForInit
                  ? `${ injector.generateRef(false) } = ${ initTransformed }`
                  : initTransformed);
            }

            const entryByProp = hasRest ? new Map(entries.map(e => [e.propNode, e])) : null;
            const rebuiltProps = hasRest
                ? allProps.map(p => {
                  const e = entryByProp.get(p);
                  if (!e) return nodeSrc(p);
                  const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : propKeySource(p);
                  return `${ keySrc }: ${ injector.generateUnusedName() }`;
                })
                : remaining.map(p => nodeSrc(p));
            if (rebuiltProps.length > 0) {
              parts.push(isAssignment
                  ? `({ ${ rebuiltProps.join(', ') } } = ${ objRef })`
                  : `${ stmtPrefix }{ ${ rebuiltProps.join(', ') } } = ${ objRef }`);
            }
          }

          const parts = [];
          const deferredSEs = [];
          if (isAssignment) {
            for (const info of infos) emitPolyfilled(info, parts, deferredSEs);
          } else {
            // interleave polyfilled and untouched declarators in source order
            const polyfilledByDecl = new Map(infos.map(i => [i.declaratorPath.node, i]));
            for (const dec of declPath.node.declarations) {
              const info = polyfilledByDecl.get(dec);
              if (info) emitPolyfilled(info, parts, deferredSEs);
              else parts.push(`${ stmtPrefix }${ nodeSrc(dec) }`);
            }
          }
          if (deferredSEs.length) parts.unshift(...deferredSEs);

          if (isForInit) {
            transforms.add(replaceNode.start, replaceNode.end, `${ keyword }${ parts.join(', ') }`);
          } else {
            // multi-statement output under an unbraced control stmt needs `{}` or tail stmts escape
            const needsBlock = parts.length > 1 && isBodylessStatementBody(declPath);
            const joined = `${ parts.join(';\n') };`;
            transforms.add(replaceNode.start, replaceNode.end,
                needsBlock ? `{ ${ joined } }` : joined);
          }
        }
      }

      const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

      function handleInExpression(meta, metaPath) {
        const { node } = metaPath;
        const symbolIn = resolveSymbolInEntry(meta.key);
        if (symbolIn && isEntryNeeded(symbolIn.entry)) {
          const binding = injectPureImport(symbolIn.entry, symbolIn.hint);
          if (meta.key === 'Symbol.iterator') {
            transforms.add(node.start, node.end, `${ binding }(${ nodeSrc(node.right) })`);
            skipWrappedNode(node.left);
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

      // replace global identifier or static member with polyfill import binding
      function replaceGlobalOrStatic(binding, node, parent, metaPath) {
        // oxc emits two Identifier nodes (key + value, or local + exported) sharing the
        // same source range for shorthand `{ Promise }` and bare `export { Promise }`
        const directParent = metaPath.parent;
        if (node.type === 'Identifier' && directParent?.type === 'Property' && directParent.shorthand
            && directParent.value === node && metaPath.parentPath?.parent?.type === 'ObjectExpression') {
          return transforms.add(node.start, node.end, `${ node.name }: ${ binding }`);
        }
        // shorthand `export { Promise }` - ESTree sets `local === exported` by reference;
        // `local === exported` identity is the canonical shorthand test (range-only match
        // would also pass for `export { Promise as Promise }`, which is a valid distinction)
        if (node.type === 'Identifier' && directParent?.type === 'ExportSpecifier'
            && directParent.local === node && directParent.exported === node) {
          return transforms.add(node.start, node.end, `${ binding } as ${ node.name }`);
        }
        // super.method(args) -> binding.call(this, args) to preserve this-binding.
        // `sliceBetweenParens` keeps every byte between `(` and `)` (comments, whitespace,
        // trailing commas); `sep` branches on AST arity so `super.foo(/* c */)` (no real args,
        // comment still round-trips inside argsSrc) doesn't get a dangling leading comma
        if (node.object?.type === 'Super' && parent?.type === 'CallExpression' && isCallee(node, parent)) {
          const argsSrc = sliceBetweenParens(parent) ?? '';
          const sep = parent.arguments.length ? ', ' : '';
          return transforms.add(parent.start, parent.end, `${ binding }.call(this${ sep }${ argsSrc })`);
        }
        // strip TS wrappers (satisfies, as, !) - meaningless after polyfill replacement
        let { start, end } = node;
        let wrapperPath = metaPath.parentPath;
        while (wrapperPath?.node && (TS_EXPR_WRAPPERS.has(wrapperPath.node.type)
            || wrapperPath.node.type === 'ParenthesizedExpression')) {
          ({ start, end } = wrapperPath.node);
          wrapperPath = wrapperPath.parentPath;
        }
        // deoptionalize `?.` - polyfill import is always defined
        if (parent?.type === 'CallExpression' && parent.optional && isCallee(node, parent)) {
          start = parent.callee.start;
          end = afterOptional(parent.callee.end, false);
        } else if (parent?.type === 'MemberExpression' && parent.optional && unwrapNode(parent.object) === node) {
          start = parent.object.start;
          end = afterOptional(parent.object.end, !parent.computed);
        }
        transforms.add(start, end, binding);
      }

      const usagePureCallback = (meta, metaPath) => {
        if (isDisabled(metaPath.node)) return;
        if (skippedNodes.has(metaPath.node)) return;
        // see babel-plugin `usagePureCallback` - `<_Map/>` would invoke polyfill as a component
        if (metaPath.node?.type === 'JSXIdentifier') return;
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

        // parent is already unwrapped past parens/chain/TS above
        if (isDeleteTarget(parent)) return;

        if (meta.kind === 'property') {
          if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
            return handleDestructuringPure(meta, metaPath, node);
          }
          if (node.type !== 'MemberExpression') return;
          if (isUpdateTarget(parent)) return;
          if (isForXWriteTarget(metaPath)) return;
          if (node.object?.type === 'Super') {
            const superMeta = resolveSuperMember(metaPath);
            if (!superMeta) return;
            // `extends MyPromise` (user-aliased pure import) - map binding → global hint
            resolveSuperImportName(injector, superMeta);
            meta = superMeta;
          }
          if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
          // `this.X` inside a class that defines its own `X` member - polyfill would
          // bypass the user's override (also bails inside static methods, where `this`
          // is the constructor, not an instance)
          if (node.object?.type === 'ThisExpression' && isShadowedByClassOwnMember(metaPath, meta.key)) return;
          if (isTaggedTemplateTag(parent, node, meta.placement)) return;
          if (meta.key === 'Symbol.iterator') return handleSymbolIterator(meta, node, parent, metaPath);
        }

        const { result: pureResult, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
        if (fallback && node.type === 'MemberExpression' && node.object?.type !== 'Super') {
          skipProxyGlobal(node);
          const binding = injectPureImport(fallback.entry, fallback.hintName);
          // deoptionalize: globalThis?.foo -> _globalThis.foo (polyfill import is always defined)
          const end = node.optional ? afterOptional(node.object.end, !node.computed) : node.object.end;
          transforms.add(node.object.start, end, binding);
          return;
        }
        if (!pureResult) return;
        const { entry: importEntry, kind, hintName } = pureResult;
        // `super.X` where X is not statically on the super class - resolve() falls back
        // from missing-static to instance, but `_binding(super)` / `_binding.call(super, ...)`
        // are syntactically invalid (super is restricted to direct member/call positions)
        if (node.type === 'MemberExpression' && node.object?.type === 'Super' && kind === 'instance') return;
        const binding = injectPureImport(importEntry, hintName);

        // mark proxy global (globalThis, self, etc.) as skipped to prevent
        // the Identifier visitor from adding an unused import
        if (node.type === 'MemberExpression') skipProxyGlobal(node);

        if (kind === 'instance' && node.type === 'MemberExpression') {
          replaceInstance(binding, node, parent, metaPath);
        } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
          replaceGlobalOrStatic(binding, node, parent, metaPath);
        }
      };

      traverse(ast, mergeVisitors({
        $: { scope: true },
        Program(path) { injector.rootScope = path.scope; },
        ...createUsageVisitors({
          onUsage: usagePureCallback,
          onWarning: msg => debugOutput?.warn(msg),
          suppressProxyGlobals: true,
          walkAnnotations: false,
        }),
      }, pass === 'post' && inherit ? {
        Identifier(path) { injector.trackReferencedName(path.node.name); },
      } : {}));
      applyDestructuringTransforms();
      state.applyTransforms(transforms);
      return finalize();
    }

    return null;
  }

  return {
    name: 'core-js-unplugin',
    transform: runTransform,
    // released by the unplugin wrapper in `buildEnd` to bound snapshot retention in
    // long-running dev servers where a pre pass ran but the matching post was skipped
    // (tree-shake, sibling bail, module invalidation)
    reset() {
      snapshots.reset();
    },
  };
}
