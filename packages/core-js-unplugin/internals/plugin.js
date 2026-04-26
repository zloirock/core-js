import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import {
  buildOffsetToLine,
  createClassHelpers,
  createTypeAnnotationChecker,
  destructureReceiverSlot,
  detectCommonJS,
  globalProxyMemberName,
  findIifeArgForParam,
  getFallbackBranchSlots,
  hasSideEffectfulSequencePrefix,
  hasTopLevelESM,
  isClassifiableReceiverArg,
  isCoreJSFile,
  isDeleteTarget,
  isForXWriteTarget,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isSynthSimpleObjectPattern,
  isTaggedTemplateTag,
  isUpdateTarget,
  mayHaveSideEffects,
  mergeVisitors,
  objectPatternPropNeedsReceiverRewrite,
  parseDisableDirectives,
  peelFallbackWrappers,
  POSSIBLE_GLOBAL_OBJECTS,
  propBindingIdentifier,
  resolveSuperImportName,
  stripQueryHash,
  TS_EXPR_WRAPPERS,
  unwrapInitValue,
  unwrapParens,
} from '@core-js/polyfill-provider/helpers';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors, createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import {
  canTransformDestructuring as sharedCanTransformDestructuring,
  enumerateFallbackDestructureBranches,
  resolveKey as sharedResolveKey,
  resolveObjectName as sharedResolveObjectName,
  resolveSymbolInEntry,
  isTypeAnnotationNodeType,
  isPolyfillableOptional,
  isViableBranchForKey,
  findProxyGlobal,
  scanExistingCoreJSImports,
} from '@core-js/polyfill-provider/detect-usage';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue, { createRewriteHint } from './transform-queue.js';
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
  isLineTerminator,
  NEEDS_GUARD_PARENS,
  NO_REF_NEEDED,
  startsEnclosingStatement,
} from './plugin-helpers.js';
import SnapshotCache from './snapshot-cache.js';

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
  // per-instance type resolvers - guardsCache/resolveCache WeakMaps don't leak across
  // plugin instances. shared between transforms WITHIN one instance is safe because
  // Node.js JS is single-threaded; Vite/Rollup contracts serialize transforms per plugin.
  // genuine parallelism (worker_threads, parallel test runs) instantiates separate plugins
  // so each gets its own typeResolvers - no cross-worker mutation race
  const typeResolvers = createResolveNodeType(nodeType, types);

  // upstream unplugin's framework union drifts - unknown values degrade to generic handling
  // (`isWebpack = false`) instead of hard-crashing every transform
  const { bundler, ...providerOptions } = options;
  if (bundler !== undefined && bundler !== null && !KNOWN_BUNDLERS.has(bundler)) {
    const list = [...KNOWN_BUNDLERS].map(b => `'${ b }'`).join(', ');
    // eslint-disable-next-line no-console -- first-run diagnostic
    console.warn(`[core-js] unknown \`bundler\` ${ JSON.stringify(bundler) } - falling back to generic handling (expected one of ${ list })`);
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
    resolveUsage, resolvePure, resolvePureGeneric, resolvePureOrGlobalFallback,
  } = resolver;
  const isWebpack = bundler === 'webpack' || bundler === 'rspack';

  // augment uncaught errors with file context. composition-bug throws via
  // `TransformQueue.#invariant` already carry `[id]` (skip those); user-callback throws
  // already start with `[core-js]` prefix (skip those - re-augmenting would double-prefix).
  // other errors (parser, internal invariants in helpers, sibling-plugin races) reach
  // here bare and benefit from the file marker. preserve original stack via in-place mutate
  function tagErrorWithFile(error, id) {
    const msg = error?.message;
    if (typeof id !== 'string' || !msg) return;
    if (msg.startsWith('[core-js]') || msg.includes(`[${ id }]`)) return;
    error.message = `[core-js] [${ id }] ${ msg }`;
  }

  function runTransform(code, id, pass = 'single') {
    try {
      return runTransformInner(code, id, pass);
    } catch (error) {
      tagErrorWithFile(error, id);
      throw error;
    }
  }

  // pipeline orchestrator; splitting further would obscure the linear flow
  // (parse → visit → queue → emit) more than it helps
  // eslint-disable-next-line max-statements -- pipeline orchestrator
  function runTransformInner(code, id, pass) {
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
    const { names: bindingNames, declaredNames, orphanRefs } = collectAllBindingNames(ast);
    injector.seedReservedNames(bindingNames);
    // gate on pre-output fingerprint - direct post calls without a prior pre shouldn't
    // adopt coincidental user-source `_ref = ...` as if they were leftover from our pipeline.
    // filter against `declaredNames` (decls + non-orphan assignments only) - `bindingNames`
    // also includes Identifier reads, which always contains the orphan target itself and
    // would make the filter dead code (every plugin-emitted `_ref` reads its own slot)
    if (pass === 'post' && !inherit && hasCoreJSPureImport(ast, packages)) {
      const adoptable = new Set();
      for (const ref of orphanRefs) if (!declaredNames.has(ref)) adoptable.add(ref);
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
    // post drops pure imports whose binding isn't referenced - sibling may have deleted
    // the usage between pre and post. enable for every post pass, not just `inherit`:
    // single-post (no pre snapshot, e.g. `phase: 'post'` without `pre`) can still emit
    // dead imports when a destructure transform drops all uses mid-pass, and the ref-tracking
    // overhead is negligible. babel-plugin doesn't call this - it resolves destructure
    // transforms synchronously during traversal
    if (pass === 'post') injector.enableReferenceTracking();

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
      // re-prepend BOM through MagicString so the sourcemap's output columns on line 0
      // account for the extra char (external string concat would leave mappings claiming
      // output[0,0] -> source[0,0] while the real output[0,0] is the BOM). gated on
      // hasChanged so no-op transforms still return null
      if (hasBOM) ms.prepend('\uFEFF');
      // in `post` pass `ms.original` is pre-pass output, not the real source - omit
      // sourcesContent so the bundler chains through pre-pass map's content instead
      // of attributing pre-output as the claimed content of `id`
      // `file` field is optional per spec but devtools and downstream chain consumers (e.g.
      // bundler `combineSourceMaps`) rely on it for output filename hints; emit it on both
      // pre and post passes so the chain stays self-describing
      // `source` (full id) and `file` (basename) must differ - MagicString's
      // `getRelativePath` collapses `sources[0]` to the basename when both equal, dropping
      // dirname for every file. devtools / `combineSourcemaps` then can't distinguish
      // files with the same basename in different dirs. patch `file` to basename so
      // `sources[0] === id` survives in the emitted map
      const fileName = id.split(/[/\\]/).pop() || id;
      const map = ms.generateMap({ source: id, file: fileName, includeContent: pass !== 'post', hires: 'boundary' });
      // restore BOM in sourcesContent so devtools show the file with its on-disk byte
      // count. MagicString's `prepend` updates the output but the original source it
      // captured for `sourcesContent` is the BOM-stripped slice we passed in
      if (hasBOM && map?.sourcesContent?.[0] && map.sourcesContent[0].charCodeAt(0) !== 0xFEFF) {
        map.sourcesContent[0] = `\uFEFF${ map.sourcesContent[0] }`;
      }
      return {
        code: ms.toString(),
        map,
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

    const {
      resolveStaticInheritedMember,
      isInheritedStaticLookup,
      isShadowedByClassOwnMember,
    } = createClassHelpers(types, estreeAdapter, sharedResolveKey);

    // usage-global mode
    if (method === 'usage-global') {
      const usageGlobalCallback = createUsageGlobalCallback({
        resolveUsage,
        injectModulesForModeEntry,
        isDisabled,
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isShadowedByClassOwnMember,
        enumerateFallbackBranches: (meta, path) => enumerateFallbackDestructureBranches(meta, path, estreeAdapter),
      });

      const usageVisitors = createUsageVisitors({
        onUsage: usageGlobalCallback,
        onWarning: msg => debugOutput?.warn(msg),
        method,
        isEntryAvailable: isEntryNeeded,
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
      // skippedNodes semantics (implicit contract across ~10 call sites):
      // 1. "don't re-visit this node" - stale visits after a parent rewrite shouldn't re-fire
      // 2. "this node is already handled by a composite rewrite" - inner members in a combined
      //    chain, RHS of `in` expression after fold to `true`
      // 3. "don't emit polyfill for this identifier" - receiver Identifier of a known member
      // a single WeakSet covers all three because the downstream check is the same: any visitor
      // that sees a node in the set exits early. keep this in mind when adding new usages
      const skippedNodes = new WeakSet();
      // declarations already rewritten by the nested-proxy batch flatten - subsequent
      // visits of other polyfillable inner props in the same declaration skip early.
      // pre / main scope-resolution divergence: pre may flatten a decl that main re-enters
      // from a different code path. the WeakSet survives both passes (scoped to one runTransform
      // invocation), so the second pass sees the flag and bails before re-flattening
      const flattenedNestedDecls = new WeakSet();
      const transforms = new TransformQueue(code, ms, id);

      // cache setScope walk-up result per leaf node - each node's enclosing scope is
      // fixed by its position in the AST, so the walk is purely a function of the node.
      // multiple traverse passes within one runTransform are SAFE (same AST, same node identity);
      // a fresh AST per file invalidates the cache via WeakMap GC
      const scopeCache = new WeakMap();

      // per-callback mutable state + deferred collections
      // setScope() runs before each callback; genRef() reads the current scope
      const state = {
        scope: -1, // insertion position for `var _ref;` inside enclosing block (-1 = file scope)
        arrow: null, // innermost arrow expression body node needing block conversion
        scopedVars: new Map(), // insertionPos -> [var names]
        arrowVars: new Map(), // arrow body node -> [var names]
        destructuring: new Map(), // ObjectPattern node -> destructuring info
        // receiver -> `{p: _polyfill, q: R.q, ...}` synth swaps, deferred to the post-traverse
        // pass so the full key set is known once every sibling prop has been visited. two
        // detection shapes feed this map:
        //   - param-default `function({p} = R)`: receiver = AssignmentPattern.right
        //   - IIFE `(({p}) => body)(R)`: receiver = CallExpression.arguments[i]
        // entry shape: `{ receiver, objectPattern, polyfills: Map<key, binding> }`
        synthSwaps: new Map(),
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
        // allocates a UID AND queues a scope-local `var X;` emission at the target block
        // (arrow-body wrap / block body / program). use this when the caller writes to the
        // ref via assignment and needs a declaration in scope. callers that emit their own
        // `const X = Y` (e.g. memo decls inside `parts`) go straight to `injector.generateRef`
        // with `hoisted: false` to avoid a duplicate bare `var X;`
        genRef(overrides) {
          const { arrow, scope } = overrides || this;
          // arrow expression body: var goes into a new block wrapping the body
          if (arrow) {
            const name = injector.generateLocalRef();
            if (!this.arrowVars.has(arrow)) this.arrowVars.set(arrow, []);
            this.arrowVars.get(arrow).push(name);
            return name;
          }
          // file scope: hoisted via injector.flush; block body: var inserted at body start
          // (caller tracks via `scopedVars` and emits its own `var X;`, so no injector-level hoist)
          const name = scope === -1 ? injector.generateHoistedRef() : injector.generateLocalRef();
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

      // wrap a polyfill binding in a source-level SequenceExpression carrying any side
      // effects collected from the receiver / computed-key. noop when empty - callers can
      // invoke unconditionally. mirrors `withSideEffects` in babel-plugin, text-based
      function wrapSideEffects(binding, sideEffects) {
        return sideEffects?.length
          ? `(${ sideEffects.map(e => nodeSrc(e)).join(', ') }, ${ binding })`
          : binding;
      }

      // a `(`-leading replacement at a statement-leading slot can fuse with the previous
      // line into a call (`a\n(...)` -> `a(...)`); inject `;` only when both conditions hit
      function asiGuardLeadingParen(replacement, metaPath, start) {
        return replacement[0] === '('
          && startsEnclosingStatement(metaPath, start)
          && canFuseWithOpenParen(code, start)
          ? `;${ replacement }`
          : replacement;
      }

      // source of `node` with its outer `ParenthesizedExpression` wrapper dropped - except
      // when the inner is a `SequenceExpression` (dropping the parens changes semantics)
      function unwrapParensSrc(node) {
        return nodeSrc(node.type === 'ParenthesizedExpression'
          && node.expression.type !== 'SequenceExpression' ? node.expression : node);
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
            while (p < src.length && !isLineTerminator(src[p])) p++;
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
          // `static /*{*/ {` -> skip past `static` + any gap before `{`. skipGap handles
          // whitespace and block/line comments (including ones containing `{` like `/*{*/`),
          // so a naive `indexOf('{')` would pick the wrong brace
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
      // skipping TS expression wrappers (TSAsExpression, TSNonNullExpression, etc.).
      // `scope` is passed to `isPolyfillableOptional` so user-shadowed globals
      // (`const Promise = MyThing; Promise?.resolve()`) don't get misclassified as
      // polyfillable - their `.resolve()` chain must keep the `?.` guard in place
      function findChainRoot(node, scope) {
        function chainChild(n) {
          return n.object || n.callee || (TS_EXPR_WRAPPERS.has(n.type) ? n.expression : null);
        }
        function makeResult(optionalNode) {
          const rootNode = optionalNode.object || optionalNode.callee;
          const deoptPositions = [];
          let cur = chainChild(node);
          while (cur && typeof cur === 'object') {
            // TS wrappers (TSAsExpression etc) have no `.object` / `.callee`; skip the position
            // entry rather than pushing undefined (stripOptionalDots would NaN on undefined pos)
            if (cur.optional) {
              const pos = cur.object?.end ?? cur.callee?.end;
              if (pos !== undefined) deoptPositions.push(pos);
            }
            if (cur === optionalNode) break;
            cur = chainChild(cur);
          }
          return { root: unwrapParensSrc(rootNode), rootRaw: nodeSrc(rootNode), deoptPositions, rootNode };
        }
        const isPoly = n => isPolyfillableOptional(n, scope, estreeAdapter, resolveBuiltIn);
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
          optionalCall, args, objectStart, preAllocatedGuardRef, sideEffects,
        } = opts;
        const strip = src => stripOptionalDots(src, objectStart ?? 0, deoptPositions);
        let bodyObj = deoptPositions?.length ? strip(objectSrc) : objectSrc;
        let guard = '';
        let guardRef = null;

        if (optionalRoot) {
          if (/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)) {
            guard = `${ optionalRoot } == null ? void 0 : `;
          } else {
            // `preAllocatedGuardRef` is allocated by the caller (combined-chain shape) and
            // expected to live in the same scope as the use site - same `state.setScope()`
            // applies to both pre-allocation and consumption. fallback `state.genRef()` reads
            // current scope at allocation time, which is the same scope this transform emits in
            guardRef = preAllocatedGuardRef ?? state.genRef();
            // ASI safety: place `null` first so the replacement starts with the `null`
            // keyword (not `(`). Otherwise an unterminated previous statement like
            // `console.log('A')\n(...)?.at(0)` would be parsed as `console.log('A')(...)`.
            guard = `null == (${ guardRef } = ${ optionalRoot }) ? void 0 : `;
            bodyObj = guardRef + bodyObj.slice(strip(rootRaw).length);
          }
        }

        let body;
        if (isNew) {
          // new arr.at(0) -> new (_at(arr))(0) - preserve user's `new` on the polyfill callee
          body = `new (${ binding }(${ bodyObj }))(${ args || '' })`;
        } else if (!isCall) {
          body = `${ binding }(${ bodyObj })`;
        } else {
          const ref = isNonIdent && bodyObj !== guardRef ? state.genRef() : null;
          const obj = ref || bodyObj;
          const firstArg = ref ? `${ ref } = ${ bodyObj }` : bodyObj;
          const dot = optionalCall ? '?.' : '.';
          const argsPart = args ? `, ${ args }` : '';
          body = `${ binding }(${ firstArg })${ dot }call(${ obj }${ argsPart })`;
        }
        // SE collected from receiver/computed-key (`arr[(SE(), "at")](0)`, `(SE(), arr).at(0)`).
        // MUST land INSIDE the optional guard branch - native `arr?.[(SE, "at")]` doesn't
        // evaluate the property when arr is nullish, so wrapping outside the conditional
        // would fire SE unconditionally and change runtime semantics
        return `${ guard }${ wrapSideEffects(body, sideEffects) }`;
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

      // is the member the OUTERMOST element of an optional chain? i.e., walking up from its
      // enclosing call (or the member itself for prop access) we hit a ChainExpression wrapper
      // before any other MemberExpression/CallExpression. narrow match: babel's AST-mutation
      // re-visit path only polyfills the outermost chain member (inner bailed members stay raw
      // because the deoptionalization + replaceWith cascade only re-enters the outer subtree).
      // matching that scope keeps unplugin's output shape aligned with babel: e.g. 5-deep chain
      // polyfills M5 via generic fallback, leaves M4 raw the same way babel does
      function isOutermostOptionalChainMember(path) {
        // skip past the wrapping call (for instance calls) before checking the chain boundary
        let current = path?.parentPath;
        if (current?.node?.type === 'CallExpression' && current.node.callee === path.node) {
          current = current.parentPath;
        }
        // peel wrappers (parens / TS) - they're expression-transparent
        while (current?.node && (current.node.type === 'ParenthesizedExpression'
          || TS_EXPR_WRAPPERS.has(current.node.type))) {
          current = current.parentPath;
        }
        return current?.node?.type === 'ChainExpression';
      }

      // resolve optional root + skip redundant guard when nested inside an outer transform
      function resolveOptionalRoot(node, parent, isCall, scope) {
        let { root, rootRaw, deoptPositions, rootNode } = findChainRoot(node, scope);
        if (root) {
          const start = isCall ? parent.start : node.start;
          const end = isCall ? parent.end : node.end;
          // dedup by rootNode identity: `x.at(a?.b.at(0))` has outer guard for `x` (none),
          // inner for `a` - skipping inner because it's range-contained would drop the
          // `a == null ? void 0 :` and crash on `a === null`. strict identity is intentional;
          // semantically-equivalent-but-distinct AST node instances stay independent
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
        // skip past TS type arguments (`arr.at<number>(-1)` - oxc puts them on `typeArguments`),
        // any `?.` between the callee and `(` (OptionalCallExpression: `foo?.()`), plus
        // whitespace and comments on either side of it
        const afterCallee = callNode.typeArguments?.end ?? callNode.callee.end;
        const openParen = skipGap(code, afterOptional(afterCallee, false));
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
      function addInstanceTransform(binding, node, parent, metaPath, isCall, replacementIsCall = isCall, sideEffects = null) {
        // bare polyfillable global receiver (`Map.entries()` -> `_entries(_Map).call(_Map)`):
        // emit the polyfill binding directly in `objectSrc` instead of pasting raw `Map` and
        // relying on text composition - babel's emit shape repeats the receiver source twice
        // (`call(receiver, args)`), but `mergeEqualRange` only swaps the first needle match
        const receiverPure = resolveReceiverPolyfill(node.object, metaPath);
        let objectSrc = receiverPure
          ? injectPureImport(receiverPure.entry, receiverPure.hintName)
          : unwrapParensSrc(node.object);
        let isNonIdent = receiverPure ? false : !NO_REF_NEEDED.has(unwrapNodeForMemoize(node.object).type);
        if (receiverPure) skippedNodes.add(node.object);
        const { optionalRoot, rootRaw, deoptPositions, rootNode } = resolveOptionalRoot(node, parent, isCall, metaPath?.scope);
        // inner polyfill sharing the chain root with an outer: reuse outer's guardRef so
        // `fn()` is evaluated once (`_at(_ref).call(_ref, 0)`, not `_at(_ref3 = fn())...`)
        let reusedOuterRef = null;
        if (!optionalRoot && rootNode && node.object === rootNode) {
          const outerRef = transforms.findOuterGuardRef(rootNode);
          if (outerRef) {
            objectSrc = outerRef;
            isNonIdent = false;
            reusedOuterRef = outerRef;
          }
        }
        // slice between parens to keep leading/trailing comments and empty-arglist comments
        const argsSrc = isCall ? sliceBetweenParens(parent) : null;
        const start = isCall ? parent.start : node.start;
        const end = isCall ? parent.end : node.end;
        // `isCallee(node, parent)` already returns true for both CallExpression and
        // NewExpression, so `isCall` covers `new`-case. filter down to NewExpression only
        const isNew = parent?.type === 'NewExpression';
        // pre-allocate so rewriteHint and buildReplacement agree on the ref name
        const preAllocatedGuardRef = optionalRoot
            && !/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)
            ? state.genRef() : null;

        let replacement = buildReplacement(binding, objectSrc, {
          isCall: replacementIsCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
          optionalCall: isCall && parent.optional, args: argsSrc,
          objectStart: node.object.start,
          preAllocatedGuardRef, sideEffects,
        });
        if (optionalRoot && guardNeedsParens(metaPath, isCall, start, end)) {
          replacement = asiGuardLeadingParen(`(${ replacement })`, metaPath, start);
        }
        // composition hint: outer rewrites `rootRaw -> guardRef` + strips `?.`, so
        // substituteInner can rebuild a matching needle when the raw slice is gone.
        // reused-outer-ref case also carries `absorbsRoot` marker so compose skips direct
        // substitution of the guard root - inner's value flows through outer's `_ref = ...`
        // assignment, and re-inlining would either corrupt `_ref` (partial replace) or
        // double-evaluate the inner (full replace)
        const hint = createRewriteHint({
          rootRaw,
          guardRef: preAllocatedGuardRef ?? reusedOuterRef,
          deoptPositions,
          objectStart: node.object.start,
          absorbsRoot: !!reusedOuterRef,
        });
        transforms.add(start, end, replacement, optionalRoot ? rootNode : null, hint);
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
        // polyfill helper loses `super`-binding (reads ancestor prototype's iterator, not
        // current class's); let the inner Symbol.iterator visitor polyfill the key while the
        // outer `super[X]` shape stays native. without this bail, addInstanceTransform would
        // emit `_getIterator(super)` / `_ref = super` - both syntax errors
        if (node.object?.type === 'Super') return;
        // SE-bearing SequenceExpression in computed key would be silently dropped by the
        // `_getIteratorMethod(obj)` rewrite (only `obj` survives). bail so the inner
        // Symbol.iterator visitor emits the static polyfill in place, SE preserved.
        // also avoids the transform-queue composition crash from inner-vs-outer overlap
        if (node.computed && hasSideEffectfulSequencePrefix(node.property)) return;
        const isCallParent = isCallee(node, parent);
        // get-iterator returns the materialized iterator; get-iterator-method returns the method.
        // use get-iterator only for plain CallExpression with no args - never for NewExpression.
        // `parent.optional` covers `arr[Symbol.iterator]?.()`; optional chains higher up the
        // tree (`arr?.[Symbol.iterator]()`) wrap the call in a ChainExpression and aren't
        // detectable here without walking ancestors - stays on get-iterator-method (correct,
        // just less compact than get-iterator)
        const isPlainCall = isCallParent && parent.type === 'CallExpression';
        const entry = isPlainCall && parent.arguments.length === 0 && !parent.optional
            ? 'get-iterator' : 'get-iterator-method';
        if (!isEntryNeeded(entry)) return;
        const binding = injectPureImport(entry, entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod');
        addInstanceTransform(binding, node, parent, metaPath, isCallParent,
          isCallParent && (parent.arguments.length > 0 || parent.optional));
        if (node.property) skipWrappedNode(node.property);
        // bare polyfillable receiver (`Symbol[Symbol.iterator]`, `Map[Symbol.iterator]`, ...)
        // is already substituted in the replacement text by `addInstanceTransform`'s
        // `resolveReceiverPolyfill` path; nothing extra to queue here
      }

      // bare global receiver (`Map`, `Symbol`, ...) -> resolved polyfill info or null. used by
      // `addInstanceTransform` to substitute the receiver directly in the replacement text -
      // single-source-of-truth for the "bare-polyfillable-global as instance-method receiver"
      // shape so `_method(_Polyfill).call(_Polyfill, ...)` outputs land in one transform write
      // instead of relying on text composition (which only swaps the first needle occurrence)
      function resolveReceiverPolyfill(obj, metaPath) {
        if (obj?.type !== 'Identifier') return null;
        if (metaPath?.scope?.hasBinding?.(obj.name)) return null;
        return resolveGlobalPolyfill(obj.name);
      }

      // text-based Babel-style OR-chain (see babel-compat.js replaceInstanceChainCombined).
      // receiver is pasted as raw source text; a `const Array = ...; arr?.[Array]...` shadow
      // would emit the user's local binding rather than the polyfill. `scope.hasBinding` check
      // on the resolved identifier catches simple cases; complex destructure-shadows fall through
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
        const receiver = unwrapParensSrc(innerCallee.object);

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

      function replaceInstance(binding, node, parent, metaPath, sideEffects) {
        // (arr?.includes)(1) - parenthesized optional callee breaks the chain.
        // replace only the member expression (not .call()). non-optional (arr.at)(0) preserves this
        if (isCallee(node, parent) && parent.callee !== node
            && parent.callee?.type === 'ParenthesizedExpression' && node.optional) {
          addInstanceTransform(binding, node, parent, metaPath, false, false, sideEffects);
          return;
        }
        const chain = findInnerPolyChain(node, parent, metaPath);
        if (chain) return replaceInstanceChainCombined(binding, node, parent, metaPath, chain);
        const isCall = isCallee(node, parent);
        addInstanceTransform(binding, node, parent, metaPath, isCall, isCall, sideEffects);
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
        })) return false;
        // ESTree-specific: assignment must be inside ExpressionStatement (unwrap ParenthesizedExpression)
        if (declaratorPath.node.type === 'AssignmentExpression') {
          let exprParent = declaratorPath.parentPath;
          while (exprParent?.node?.type === 'ParenthesizedExpression') exprParent = exprParent.parentPath;
          if (exprParent?.node?.type !== 'ExpressionStatement') return false;
        }
        return true;
      }

      // find the call-arg node a bare-ObjectPattern IIFE param resolves to. arrow-only on
      // purpose - FunctionExpression IIFE would leak the synth into `arguments[i]`.
      // expands inline-array spreads (`...[R]`) the same way `resolveCallArgument` does;
      // non-literal spread returns null (static index unknown).
      // ArrowFunctionExpression-only by design: `function() {}` IIFE has its own `this`
      // binding, so the destructure-receiver semantics differ enough that synth-swap
      // would be unsafe. arrow-only is a deliberate narrowing on top of the shared
      // `findIifeArgForParam` (which accepts both arrow and FunctionExpression for
      // resolution-layer use)
      function detectIifeArgReceiver(wrapperPath, objectPattern) {
        if (wrapperPath?.node?.type !== 'ArrowFunctionExpression') return null;
        return findIifeArgForParam(wrapperPath, objectPattern);
      }

      // receiver node to swap; null means inline-default fallback. handles
      // `function({p} = R)` (AssignmentPattern.right) and arrow IIFE `(({p}) => body)(R)`
      // (call-arg node, expanding inline-array spreads).
      // mirrors babel-plugin's `findSynthSwapTargetPath` and the resolution-layer narrowing:
      // caller-arg replaces wrapper-default ONLY when statically classifiable (Identifier).
      // for non-Identifier caller-arg, wrapper-default remains the synth target so the
      // runtime fallback path carries the polyfill
      function findSynthSwapReceiver(wrapperPath, objectPattern) {
        if (objectPattern?.properties?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement')) return null;
        const wrapper = wrapperPath?.node;
        if (wrapper?.type === 'AssignmentPattern' && wrapper.left === objectPattern) {
          // oxc preserves `ParenthesizedExpression` around the default; babel strips it.
          // peel here so `function f({from} = (Array))` matches bare-`Array` synth-swap path
          const peeled = unwrapParens(wrapper.right);
          if (peeled?.type === 'Identifier') {
            const argReceiver = detectIifeArgReceiver(wrapperPath.parentPath, wrapperPath.node);
            return isClassifiableReceiverArg(argReceiver) ? argReceiver : peeled;
          }
        }
        const argReceiver = detectIifeArgReceiver(wrapperPath, objectPattern);
        return isClassifiableReceiverArg(argReceiver) ? argReceiver : null;
      }

      // top-level destructure path (`const {from} = cond ? Array : Set`, assignment-target).
      // resolves the wrapper's RHS slot per parent shape, then delegates to the shared
      // per-branch helper. wraps to keep `handleDestructuringPure` under the lint statement-cap
      function tryFromFallbackPerBranchSynth(metaPath, propNode) {
        const wrapperNode = metaPath.parentPath?.parentPath?.node;
        const slot = destructureReceiverSlot(wrapperNode);
        if (!slot) return;
        tryRegisterPerBranchSynth(wrapperNode[slot], propNode, metaPath.parent, metaPath.scope);
      }

      // ConditionalExpression / LogicalExpression in destructure-receiver position
      // (`= cond ? Array : Set` / `= Array || Set`). `meta.fromFallback` flags this case -
      // the resolved meta tracks ONE branch but runtime picks per-call. for branches
      // statically resolvable to a known global with a viable static polyfill for the
      // destructured key, register a per-branch synth-swap so each branch becomes its own
      // `{key: _Branch$key, ...}` literal. branches without viable polyfill are left raw -
      // the constructor identifier visitor still emits `_Set` etc. for shadow-correct globals.
      // returns true when at least one branch was registered
      function tryRegisterPerBranchSynth(rhs, propNode, objectPattern, scope) {
        if (!rhs || !propNode || !objectPattern) return false;
        if (!isSynthSimpleObjectPattern(objectPattern)) return false;
        if (propNode.computed || propNode.key?.type !== 'Identifier') return false;
        // peel ParenthesizedExpression + TS expression wrappers so paren-wrapped or TS-cast
        // fallback receivers (`(cond ? A : B) as any`) reach the slot resolver. NOTE: do NOT
        // peel chain-assignment here - `foo = cond ? Array : Set` is intentional escape hatch
        // (rewriting branches as synth literals would change `foo`'s runtime value)
        const inner = peelFallbackWrappers(rhs);
        const slots = getFallbackBranchSlots(inner);
        if (!slots) return false;
        const key = propNode.key.name;
        let registered = false;
        for (const slot of slots) {
          const branch = inner[slot];
          const pure = isViableBranchForKey(branch, key, scope, estreeAdapter, resolvePure);
          if (!pure) continue;
          const binding = injectPureImport(pure.entry, pure.hintName);
          // skip both the wrapper (ParenthesizedExpression / TS expression) AND the inner
          // Identifier - otherwise the inner Identifier visitor fires on `Iterator` and emits
          // a parallel constructor polyfill (`_Iterator`) that conflicts with the synth-swap
          // emit (`{from: _Iterator$from}`)
          let cur = branch;
          while (cur) {
            skippedNodes.add(cur);
            if (cur.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
            else break;
          }
          let pending = state.synthSwaps.get(branch);
          if (!pending) {
            pending = { receiver: branch, objectPattern, polyfills: new Map() };
            state.synthSwaps.set(branch, pending);
          }
          pending.polyfills.set(key, binding);
          registered = true;
        }
        return registered;
      }

      // parameter destructure. synth-swap when `findSynthSwapReceiver` identifies a safe
      // Identifier receiver; otherwise inline-default `{p = _polyfill}`.
      // AssignmentPattern value (`{from = []}`): accept and polyfill via synth-swap - the
      // user's default becomes dead code because synth-polyfilled property is always defined
      function handleParameterDestructurePure(meta, metaPath, propNode) {
        const { value } = propNode;
        if (!isIdentifierPropValue(value)) return;
        // `function f({from} = cond ? Array : Set)` - runtime picks per-call. attempt
        // per-branch synth-swap so each viable branch becomes its own `{from: _A$from}` /
        // `{from: _B$from}` literal. branches without a viable polyfill stay raw.
        // a static inline-default would alias the fallback, mis-binding the other branch
        if (meta.fromFallback) {
          const wrapperNode = metaPath.parentPath?.parentPath?.node;
          const slot = destructureReceiverSlot(wrapperNode);
          if (slot) tryRegisterPerBranchSynth(wrapperNode[slot], propNode, metaPath.parent, metaPath.scope);
          return;
        }
        const isAssign = value.type === 'AssignmentPattern';
        const pureResult = resolvePure(meta, metaPath);
        if (!pureResult || pureResult.kind === 'instance') return;
        const binding = injectPureImport(pureResult.entry, pureResult.hintName);
        const objectPattern = metaPath.parent;
        // synth-swap emits `{key: value, ...}` from non-computed Identifier-keyed props.
        // any computed / RestElement / non-Identifier key can't be reconstructed from AST
        // alone (source slices + possible side-effects in computed keys). bail to inline
        // default for the current prop - the original `= Receiver` + the sibling computed
        // prop stay intact in the output
        const receiver = isSynthSimpleObjectPattern(objectPattern)
          ? findSynthSwapReceiver(metaPath.parentPath?.parentPath, objectPattern) : null;
        if (!receiver) {
          // no receiver for synth-swap: fall back to inline default. for AssignmentPattern,
          // rewrite the user's default to the polyfill id (left side is the binding, right
          // side is the default expression); for bare Identifier append ` = polyfill`
          if (isAssign) transforms.add(value.right.start, value.right.end, binding);
          else ms.appendRight(value.end, ` = ${ binding }`);
          return;
        }
        // synth-swap owns the receiver - identifier visitor would race on the same range
        skippedNodes.add(receiver);
        let pending = state.synthSwaps.get(receiver);
        if (!pending) {
          pending = { receiver, objectPattern, polyfills: new Map() };
          state.synthSwaps.set(receiver, pending);
        }
        pending.polyfills.set(propNode.key.name, binding);
      }

      // resolve a bare global name (`Array`, `Promise`, `globalThis`) to its pure polyfill
      // binding info; null when not polyfillable as a global. `resolvePure` without path is
      // safe for `kind: 'global'` - `enhanceMeta`'s path-dependent `resolvePropertyObjectType`
      // only fires for instance kind, and global-meta inputs never resolve to instance
      function resolveGlobalPolyfill(name) {
        const pure = resolvePure({ kind: 'global', name });
        return pure && pure.kind !== 'instance' ? pure : null;
      }

      // intermediate slots permitted on the walk from an inner Property up to the enclosing
      // VariableDeclaration. any other shape -> foreign wrapper, bail safely
      const NESTED_DESTRUCTURE_WALK_TYPES = new Set(['ObjectPattern', 'Property', 'VariableDeclarator']);

      // walk Property/ObjectPattern pairs up to the enclosing VariableDeclaration. 2-level
      // nest is 5 hops, every additional alias-hop adds 2. returns the declaration's path
      // or null when the chain leaves the allowed-types set
      function walkUpNestedDestructureToDeclaration(startPath) {
        let current = startPath;
        while (current && current.node?.type !== 'VariableDeclaration') {
          if (!NESTED_DESTRUCTURE_WALK_TYPES.has(current.node?.type)) return null;
          current = current.parentPath;
        }
        return current;
      }

      // `const { Array: { from, of } } = globalThis` -> `const from = _Array$from; const of = _Array$of;`
      // batch-rewrite on first visit: walk all declarators, extract every polyfillable inner
      // binding, rebuild the declaration with siblings (or drop entirely). subsequent visits
      // are no-ops. scope limited to proxy-global receiver (globalThis/self/window) - plain
      // `{ from } = Array` is handled by the state machine below
      // walk up the nested-destructure chain to the outer ObjectPattern, then to the host
      // (AssignmentExpression). returns the host path or null. mirror of
      // `walkUpNestedDestructureToDeclaration` but terminating at AssignmentExpression
      function walkUpNestedDestructureToAssignment(startPath) {
        let current = startPath;
        while (current && current.node?.type !== 'AssignmentExpression') {
          if (!NESTED_DESTRUCTURE_WALK_TYPES.has(current.node?.type)) return null;
          current = current.parentPath;
        }
        return current;
      }

      // `({Array: {from}} = receiver);` (AssignmentExpression in ExpressionStatement) -
      // value is discarded, replace whole statement with `from = _polyfill;` so polyfill
      // always wins. SE prefix in receiver lifts as separate statement. matches babel-plugin's
      // `flattenAssignmentExpressionDestructure`
      function tryFlattenAssignmentExpressionDestructure(metaPath, meta) {
        const valueNode = propBindingIdentifier(metaPath.node.value);
        if (!valueNode) return false;
        const assignPath = walkUpNestedDestructureToAssignment(metaPath.parentPath);
        const assignNode = assignPath?.node;
        if (!assignNode || assignNode.operator !== '=') return false;
        // peel oxc's preserved `({...} = G)` parens to reach the ExpressionStatement above
        let stmtPath = assignPath.parentPath;
        while (stmtPath?.node?.type === 'ParenthesizedExpression') stmtPath = stmtPath.parentPath;
        if (stmtPath?.node?.type !== 'ExpressionStatement') return false;
        const stmtNode = stmtPath.node;
        const pure = resolvePure(meta);
        if (!pure || pure.kind === 'instance') return false;
        const binding = injectPureImport(pure.entry, pure.hintName);
        // SE prefix `(se(), G)` lifts as separate statement before the rewrite. peel paren
        // wrap around the SE (oxc preserves; babel strips). uses shared `peelFallbackWrappers`
        const inner = peelFallbackWrappers(assignNode.right);
        const prefix = inner?.type === 'SequenceExpression' && inner.expressions.length > 1
          ? `${ inner.expressions.slice(0, -1).map(nodeSrc).join(', ') };\n`
          : '';
        // skip nodes inside the destructure subtree to prevent re-processing
        walkAstNodes(assignNode, n => skippedNodes.add(n));
        transforms.add(stmtNode.start, stmtNode.end, `${ prefix }${ valueNode.name } = ${ binding };`);
        return true;
      }

      function tryFlattenNestedProxyDestructurePure(metaPath) {
        // accept `{ from }` / `{ from: alias }` / `{ from = default }` / `{ from: alias = default }`.
        // user's default is dropped since the extracted polyfill is always defined (see `planInnerProp`)
        if (!propBindingIdentifier(metaPath.node.value)) return false;
        const declPath = walkUpNestedDestructureToDeclaration(metaPath.parentPath);
        const declaration = declPath?.node;
        if (declaration?.type !== 'VariableDeclaration') return false;
        if (flattenedNestedDecls.has(declaration)) return true;
        const parentNode = declPath.parentPath?.node;
        const isForInit = parentNode?.type === 'ForStatement' && parentNode.init === declaration;
        // oxc wraps `(expr1, expr2)` parens as ParenthesizedExpression - peel before SE check
        const initOf = i => {
          let n = declaration.declarations[i].init;
          if (n?.type === 'ParenthesizedExpression') n = n.expression;
          return n;
        };
        // for-init with SE init can't host a prefix statement outside the loop header.
        // bail before `rewriteProxyNestedDeclarator` runs - it would inject pure imports
        // that then go unused when we can't emit the flatten replacement
        if (isForInit) {
          for (let i = 0; i < declaration.declarations.length; i++) {
            if (initOf(i)?.type === 'SequenceExpression') return false;
          }
        }
        // per-declarator order preserved so rendering keeps source position
        // (`let i = 0, { Array: { from } } = globalThis` -> `let i = 0, from = _from`)
        const perDecl = declaration.declarations.map(d => rewriteProxyNestedDeclarator(d, metaPath.scope));
        if (!perDecl.some(r => r.extractions.length)) return false;
        flattenedNestedDecls.add(declaration);
        // flattened declarators' descendants are consumed by the outer text-emit; preserved
        // siblings keep AST visible so the identifier visitor's transforms compose into the
        // outer's replacement. exception: a sibling reusing the flattened receiver's name
        // (`{X:{m}}=globalThis, y=globalThis`) would mismatch compose's nth-count - source has
        // N occurrences, outer's replacement has N-1 (flatten ate one). pre-substitute those
        // refs to drop them from compose's needle search
        const flattenedReceivers = new Set();
        for (let i = 0; i < perDecl.length; i++) {
          if (!perDecl[i].extractions.length) continue;
          // seed skippedNodes ONLY for the consumed parts: the ObjectPattern (id) and the
          // receiver tail (last expr of SE init). SE-prefix expressions are preserved as
          // source text via `sePrefixes` below - their inner Identifiers (e.g. `Promise`
          // in `(Promise.resolve(...).then(noop), globalThis)`) need natural visitor pass
          // to emit their own polyfill imports. seeding the whole declarator would block
          // those polyfill emissions silently
          const decl = declaration.declarations[i];
          walkAstNodes(decl.id, n => skippedNodes.add(n));
          // peel ParenthesizedExpression (oxc keeps it; babel strips) before SE-tail check.
          // without peel, `(Promise.resolve(...), globalThis)` lands as ParenthesizedExpression
          // and the whole init (including SE prefix Promise.resolve) gets seeded as skipped,
          // suppressing polyfill emission for the SE prefix expressions
          let initInner = decl.init;
          while (initInner?.type === 'ParenthesizedExpression') initInner = initInner.expression;
          const consumedTail = initInner?.type === 'SequenceExpression' ? initInner.expressions.at(-1) : initInner;
          if (consumedTail) walkAstNodes(consumedTail, n => skippedNodes.add(n));
          if (perDecl[i].receiver) flattenedReceivers.add(perDecl[i].receiver);
        }
        if (flattenedReceivers.size) {
          for (let i = 0; i < perDecl.length; i++) {
            if (!perDecl[i].extractions.length) {
              perDecl[i].preservedSrc = polyfillSiblingReceiverRefs(declaration.declarations[i], flattenedReceivers);
            }
          }
        }
        let replacement = renderFlattenedNestedProxy(perDecl, declaration.kind, isForInit);
        // preserve SE prefix when init is `(se(), receiver)`: the non-nested destructure path
        // already lifts SE expressions as statements via `buildDestructuringInitMeta`; do the
        // same here so nested receivers retain the preceding side-effect semantics. for-init
        // can't host statements outside the loop header, so SE there is dropped (caller bails
        // earlier if the for-init declarator has SE). multi-decl: lift SE per declarator that
        // has one, in source order, before the rendered replacement
        if (!isForInit) {
          const sePrefixes = [];
          for (let i = 0; i < declaration.declarations.length; i++) {
            const init = initOf(i);
            if (init?.type === 'SequenceExpression' && init.expressions.length > 1) {
              sePrefixes.push(init.expressions.slice(0, -1).map(nodeSrc).join(', '));
            }
          }
          if (sePrefixes.length) replacement = `${ sePrefixes.map(p => `${ p };`).join('\n') }\n${ replacement }`;
        }
        transforms.add(declaration.start, declaration.end, replacement);
        return true;
      }

      // for-init: single `kind d1, d2, d3` - `\n`-separated statements parse as for-init-test-
      // update with the middle declaration as test, a syntax error.
      // block-level: extractions split to separate statements (match babel), preserved
      // declarators collapse into one trailing `kind` statement
      function renderFlattenedNestedProxy(perDecl, kind, isForInit) {
        if (isForInit) {
          const parts = [];
          for (const r of perDecl) {
            for (const e of r.extractions) parts.push(e.decl);
            if (r.preservedSrc !== null) parts.push(r.preservedSrc);
          }
          return `${ kind } ${ parts.join(', ') }`;
        }
        const extractedLines = perDecl.flatMap(r => r.extractions.map(e => `${ kind } ${ e.decl };`));
        const preservedDecls = perDecl.map(r => r.preservedSrc).filter(s => s !== null);
        return extractedLines.join('\n')
          + (preservedDecls.length ? `\n${ kind } ${ preservedDecls.join(', ') };` : '');
      }

      // plan factory: classify every outer prop of a proxy-global declarator without
      // side effects. returned shape:
      //   { receiver, outerProps: [{ extractions?, preservedSrc }] }
      // preservedSrc === null -> outer prop was fully consumed (drop).
      // null when the init isn't a proxy-global ObjectPattern source or nothing matches
      // pre-pass walks every declarator for `canFullyConsume...`; main pass walks the same
      // declarators again via `rewriteProxy...`. cache by node identity to avoid double work -
      // amortizes the double traverse to one logical plan per declarator (O(1) lookup on the
      // second visit instead of re-scanning every property)
      const planCache = new WeakMap();
      function planProxyNestedDeclarator(declarator, scope) {
        if (planCache.has(declarator)) return planCache.get(declarator);
        let plan = null;
        if (declarator.id?.type === 'ObjectPattern' && declarator.id.properties.length) {
          // `(se(), globalThis)` - unwrap to the semantic init value so nested receivers
          // resolve through SequenceExpression prefixes + preserved parens. parity with
          // non-nested destructure which goes through `buildDestructuringInitMeta`
          const init = unwrapInitValue(declarator.init);
          const receiver = init ? sharedResolveObjectName(init, scope, estreeAdapter) : null;
          if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)) {
            const outerProps = declarator.id.properties.map(planOuterProp);
            if (outerProps.some(p => p.extractions?.length)) plan = { receiver, outerProps };
          }
        }
        planCache.set(declarator, plan);
        return plan;
      }

      // proxy-global outer prop: four shapes
      //   - `{ Foo: { bar, ... } }` where Foo is a real global - inner pattern holds static methods
      //   - `{ Self: { ... } }` where Self is itself a proxy-global (`self`/`window`/...) -
      //     alias hop, recurse through the nested pattern keeping the chain transparent.
      //     enables N-level nests like `{ self: { window: { Array: { from } } } } = globalThis`
      //   - `{ Foo }` shorthand - polyfill Foo as a global
      //   - `{ Foo: alias }` aliased - same, different local name
      function planOuterProp(outerProp) {
        if (outerProp.type !== 'Property' || outerProp.computed
          || outerProp.key?.type !== 'Identifier') {
          return { preservedSrc: nodeSrc(outerProp) };
        }
        const { name } = outerProp.key;
        if (outerProp.value?.type === 'ObjectPattern') {
          // proxy-global alias hop (`self`/`window`/...): each nested prop goes through the
          // same outer-prop planner. real-global container: nested props hold static-method
          // extractions keyed by `name`
          const planChild = POSSIBLE_GLOBAL_OBJECTS.has(name)
            ? planOuterProp
            : innerProp => planInnerProp(innerProp, name);
          return foldNestedPattern(outerProp, planChild);
        }
        if (outerProp.value?.type === 'Identifier') {
          const pure = resolveGlobalPolyfill(name);
          if (!pure) return { preservedSrc: nodeSrc(outerProp) };
          return {
            extractions: [{ entry: pure.entry, hint: pure.hintName, localName: outerProp.value.name }],
            preservedSrc: null,
          };
        }
        return { preservedSrc: nodeSrc(outerProp) };
      }

      // fold an ObjectPattern-valued outer prop: plan each child, concat extractions,
      // rebuild preserved shape. empty extractions -> bail as opaque; all consumed -> null
      // preservedSrc (caller drops the prop); partial -> `name: { a, b }` with survivors
      function foldNestedPattern(outerProp, planChild) {
        const extractions = [];
        const preservedInner = [];
        for (const child of outerProp.value.properties) {
          const e = planChild(child);
          if (e.extractions?.length) extractions.push(...e.extractions);
          if (e.preservedSrc !== null && e.preservedSrc !== undefined) preservedInner.push(e.preservedSrc);
        }
        if (!extractions.length) return { preservedSrc: nodeSrc(outerProp) };
        if (!preservedInner.length) return { extractions, preservedSrc: null };
        return { extractions, preservedSrc: `${ outerProp.key.name }: { ${ preservedInner.join(', ') } }` };
      }

      // inner prop (static method on the nested global): `{ Array: { from } }` - `from` on
      // `Array`. only simple Identifier values; rest / default / non-Identifier / unknown
      // keys fall back to `preservedSrc`. uses the bare `resolveBuiltIn` meta resolver first
      // to filter instance kind - `resolvePure` with no path would crash on `enhanceMeta`'s
      // `isMemberLike(path)` for instance resolutions
      function planInnerProp(prop, receiverName) {
        if (prop.type !== 'Property' || prop.computed
          || prop.key?.type !== 'Identifier') {
          return { preservedSrc: nodeSrc(prop) };
        }
        // accept `{ from }`, `{ from: alias }`, `{ from = default }`, `{ from: alias = default }`.
        // user's default is dropped: polyfill is always defined, the user's default would be
        // dead code (fires only on undefined property, which polyfill rules out). fully-flattened
        // legs also avoid walkAstNodes-skip leaving inner polyfillable expressions unrewritten
        const valueNode = propBindingIdentifier(prop.value);
        if (!valueNode) return { preservedSrc: nodeSrc(prop) };
        const meta = { kind: 'property', object: receiverName, key: prop.key.name, placement: 'static' };
        if (resolveBuiltIn(meta)?.kind === 'instance') return { preservedSrc: nodeSrc(prop) };
        const pure = resolvePure(meta);
        if (!pure || pure.kind === 'instance') return { preservedSrc: nodeSrc(prop) };
        return {
          extractions: [{ entry: pure.entry, hint: pure.hintName, localName: valueNode.name }],
          preservedSrc: null,
        };
      }

      // execute the plan: inject polyfill imports, emit extractions. returns
      // `{ extractions: [{ decl }], preservedSrc }` where `preservedSrc` is null when the
      // declarator is fully consumed, raw src when there's no plan to touch, or a rebuilt
      // `{ ... } = init` source when outer siblings remain
      function rewriteProxyNestedDeclarator(declarator, scope) {
        const plan = planProxyNestedDeclarator(declarator, scope);
        if (!plan) return { extractions: [], preservedSrc: nodeSrc(declarator), receiver: null };
        const extractions = [];
        const preservedOuter = [];
        // RestElement in outer pattern - rest gathers all OTHER own keys, so dropping a
        // fully-consumed key from `{Array: {from}, ...rest} = globalThis` would change
        // runtime semantics (`rest.Array` becomes defined, original excluded it). keep
        // a `Foo: _unused` sentinel for each consumed key when rest is present
        const hasRest = declarator.id.properties.some(p => p.type === 'RestElement');
        for (let i = 0; i < plan.outerProps.length; i++) {
          const outer = plan.outerProps[i];
          for (const e of outer.extractions ?? []) {
            const binding = injectPureImport(e.entry, e.hint);
            extractions.push({ decl: `${ e.localName } = ${ binding }` });
          }
          if (outer.preservedSrc !== null) {
            preservedOuter.push(outer.preservedSrc);
          } else if (hasRest) {
            const sourceProp = declarator.id.properties[i];
            const keyName = sourceProp?.key?.name;
            if (keyName) preservedOuter.push(`${ keyName }: ${ injector.generateUnusedName() }`);
          }
        }
        if (!preservedOuter.length) return { extractions, preservedSrc: null, receiver: plan.receiver };
        // partial flatten: preserved declarator still destructures from the receiver,
        // so polyfill it - old runtimes without `globalThis` / `self` would crash otherwise
        const receiverPure = resolveGlobalPolyfill(plan.receiver);
        const initSrc = receiverPure
          ? injectPureImport(receiverPure.entry, receiverPure.hintName)
          : nodeSrc(declarator.init);
        return {
          extractions,
          preservedSrc: `{ ${ preservedOuter.join(', ') } } = ${ initSrc }`,
          receiver: plan.receiver,
        };
      }

      // pre-pass helper: true when every outer prop was fully consumed - flatten will
      // discard the declarator's init, so `_globalThis` injection can be suppressed
      function canFullyConsumeProxyDeclarator(d, scope) {
        const plan = planProxyNestedDeclarator(d, scope);
        return !!plan && plan.outerProps.every(p => p.preservedSrc === null);
      }

      // sibling-side companion of `rewriteProxyNestedDeclarator` for multi-decl flatten.
      // walks a preserved-only declarator for Identifiers matching any flattened receiver name,
      // substitutes them with their polyfill binding directly in the rendered source, and seeds
      // skippedNodes so identifier visitor doesn't queue a parallel transform that would mismatch
      // TransformQueue's nth-count compose
      function polyfillSiblingReceiverRefs(declarator, flattenedReceivers) {
        // collect (identifier, parent) pairs so we can filter out Identifiers whose enclosing
        // MemberExpression resolves to a polyfillable global (e.g. `globalThis.Map`). the
        // outer MemberExpression transform replaces the whole `globalThis.Map` range with
        // `_Map`, and a competing inline substitution `globalThis -> _globalThis` would land
        // a `_globalThis.Map` substring INSIDE the outer's `_Map` content during compose,
        // turning the inner needle search into a partial match (`__Map` corruption)
        const matches = [];
        walkAstNodes(declarator, (n, parent) => {
          if (n.type !== 'Identifier' || !flattenedReceivers.has(n.name)) return;
          if (parent?.type === 'MemberExpression' && parent.object === n && !parent.computed
              && parent.property?.type === 'Identifier' && resolveGlobalPolyfill(parent.property.name)) {
            // outer MemberExpression transform consumes this; skip self-substitution
            return;
          }
          matches.push(n);
        });
        if (!matches.length) return nodeSrc(declarator);
        // descending source order so prior substitutions don't shift later relative indices
        matches.sort((a, b) => b.start - a.start);
        const declStart = declarator.start;
        let src = nodeSrc(declarator);
        for (const m of matches) {
          const pure = resolveGlobalPolyfill(m.name);
          if (!pure) continue;
          skippedNodes.add(m);
          src = src.slice(0, m.start - declStart)
            + injectPureImport(pure.entry, pure.hintName)
            + src.slice(m.end - declStart);
        }
        return src;
      }

      // recursive AST walker - seeds skippedNodes before batch overwrite so queued visits
      // on descendants short-circuit (no duplicate polyfill inject from sibling handlers).
      // O(N) per call where N is subtree size; callers feed it small subtrees (declarator,
      // RHS of `in`, inner-callee chain) so total amortized cost across the file is bounded.
      // `visit(node, parent)` - parent is the directly-enclosing AST node, null at root,
      // used by callers (`polyfillSiblingReceiverRefs`) for context-aware filtering.
      // depth cap protects against pathological deeply-nested AST (template-literal bombs,
      // oxc bug-emitted cycles). 1024 covers realistic depth bounds with margin
      function walkAstNodes(root, visit, parent = null, depth = 0) {
        if (!root || typeof root !== 'object' || typeof root.type !== 'string' || depth >= 1024) return;
        visit(root, parent);
        for (const key of Object.keys(root)) {
          const value = root[key];
          if (Array.isArray(value)) for (const v of value) walkAstNodes(v, visit, root, depth + 1);
          else walkAstNodes(value, visit, root, depth + 1);
        }
      }

      // Symbol.iterator handling is split across `handleSymbolIterator` (member-call form),
      // this fn (property-destructure form `{ [Symbol.iterator]: it } = obj`), and the catch
      // emit loop. unification would require a unified meta shape across the three call sites,
      // not currently warranted - each call site has different bound/unbound receiver semantics
      function handleDestructuringPure(meta, metaPath, propNode) {
        // IIFE / parameter destructure: ObjectPattern at function-param position, optionally
        // wrapped in AssignmentPattern default (`function({x} = R)`) and/or nested in
        // ArrayPattern (`function([{x} = R])`). metaPath -> Property; metaPath.parentPath -> ObjectPattern
        if (isFunctionParamDestructureParent(metaPath.parentPath)) {
          return handleParameterDestructurePure(meta, metaPath, propNode);
        }
        // nested proxy-global destructure `{ Array: { from } } = globalThis` - default
        // wouldn't fire (Array.from is always non-undefined on the target engines, just
        // potentially buggy). flatten to `const from = _Array$from` when both inner + outer
        // patterns hold only this one chain; fall back to param-default for complex shapes
        if (metaPath.parentPath?.parentPath?.node?.type === 'Property') {
          if (tryFlattenNestedProxyDestructurePure(metaPath)) return;
          // AssignmentExpression-in-ExpressionStatement form `({Array:{from}} = globalThis);`:
          // value is discarded, replace whole statement with `from = _polyfill;` so polyfill
          // always wins (inline-default fallback would pick native Array.from on modern
          // engines, contradicting usage-pure's polyfill-always contract)
          if (tryFlattenAssignmentExpressionDestructure(metaPath, meta)) return;
          return handleParameterDestructurePure(meta, metaPath, propNode);
        }
        // two-pass post: skip `{ key: _unusedN, ...rest }` sentinels left by pre -
        // the inherited unusedNames set tracks them so we don't duplicate extraction
        if (propNode.value?.type === 'Identifier'
            && injector.hasGeneratedUnusedName(propNode.value.name)) return;
        if (!canTransformDestructuring(metaPath)) return;
        if (meta.fromFallback) return tryFromFallbackPerBranchSynth(metaPath, propNode);
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
        if (value && !propBindingIdentifier(value)) return;
        // Symbol.iterator: resolve normally fails (not in instance table), use getIteratorMethod
        const isSymbolIterator = propNode.computed && meta.key === 'Symbol.iterator';
        const pureResult = isSymbolIterator ? null : resolvePure(meta, metaPath);
        if (!pureResult && !isSymbolIterator) return;

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
        // per-prop guard (unlike babel's all-or-nothing): skip THIS prop when it doesn't
        // force extraction (computed / default) AND the pattern has no RestElement sibling
        // AND the catch body never reads the destructured name. `injectPureImport` below
        // would otherwise register an orphan polyfill module for a prop that emits no use.
        // other props in the same pattern can still force whole-pattern extraction - this
        // guard only suppresses THIS prop's polyfill entry, not the pattern-level rewrite
        if (isCatchClause && !objectPatternPropNeedsReceiverRewrite(propNode)
            && !objectPattern.properties.some(p => p.type === 'RestElement')) {
          let referenced = false;
          walkAstNodes(declaratorPath.node.body, n => {
            if (!referenced && n.type === 'Identifier' && n.name === localName) referenced = true;
          });
          if (!referenced) return;
        }
        const kind = isSymbolIterator ? 'instance' : pureResult.kind;
        const binding = isSymbolIterator
            ? injectPureImport('get-iterator-method', 'getIteratorMethod')
            : injectPureImport(pureResult.entry, pureResult.hintName);
        const isAssignment = !isCatchClause && declaratorPath?.node?.type === 'AssignmentExpression';
        let declPath = isCatchClause ? declaratorPath : declaratorPath?.parentPath;
        // unwrap ParenthesizedExpression for assignment: ({ from } = Array) -> ExpressionStatement
        if (isAssignment) {
          while (declPath?.node?.type === 'ParenthesizedExpression') declPath = declPath.parentPath;
        }
        // get init source for instance methods (catch clause: generated ref replaces param)
        const initNode = isCatchClause ? null
            : isAssignment ? declaratorPath?.node?.right : declaratorPath?.node?.init;

        if (!state.destructuring.has(objectPattern)) {
          // only allocate `_refN` on first-seen pattern - a multi-property pattern visits
          // once per polyfillable key, and generating a ref each time would inflate the
          // UID counter without using the later IDs (state.destructuring.set only fires
          // on first visit, so subsequent IDs are abandoned)
          const initSrc = isCatchClause ? injector.generateLocalRef() : initNode ? nodeSrc(initNode) : null;
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
            initIdentName: unwrapParens(initNode)?.type === 'Identifier' ? unwrapParens(initNode).name : null,
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
                    // instance methods (arr.slice) - instance methods compose correctly.
                    // computed keys (`arr[Promise]`) are NOT walked: a global referenced as a
                    // computed key IS a real read and SHOULD get its polyfill import via the
                    // identifier visitor; skipping would lose that
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
            const testRef = e.kind === 'instance' ? injector.generateLocalRef() : null;
            const test = testRef ? `(${ testRef } = ${ valueSrc })` : valueSrc;
            lines.push(`let ${ testRef ? `${ testRef }, ` : '' }${ e.localName } = ${ test } === void 0 ? ${ e.defaultSrc } : ${ testRef || valueSrc };`);
          } else {
            lines.push(`let ${ e.localName } = ${ valueSrc };`);
          }
        }
        // rest element: rebuild full pattern with polyfilled keys renamed to unused bindings.
        // `polyfillKeyContent` is `extractContent(p.key.start, p.key.end)` - the key expression
        // bounds exclude the surrounding `[` `]`, so wrapping unconditionally is safe (no
        // double-bracket risk). would only matter if a future caller passes pre-bracketed text
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

      // post-traverse: emit `{p: _polyfill, q: R.q, ...}` over the receiver span. runs
      // after main traverse - full polyfill set per receiver known only after sibling visits.
      // non-polyfilled siblings read from pure receiver when receiver itself is polyfillable
      // (raw `Promise.custom` on IE11 would ReferenceError before the destructure runs).
      // partial-rewrite risk: an exception inside the loop leaves `state.synthSwaps` half-applied
      // (some transforms queued, others lost). recovery semantics intentional: catch-and-continue
      // would silently produce inconsistent output, hard fail surfaces the bug to the user
      function applySynthSwaps() {
        for (const [, { receiver, objectPattern, polyfills }] of state.synthSwaps) {
          if (objectPattern?.type !== 'ObjectPattern') continue;
          // peel paren / TS wrappers around the receiver - `cond ? (Array) : (Iterator)`
          // (oxc keeps parens) registers the ParenthesizedExpression as receiver, but the
          // identifier-name lookup (and shadow-check via `resolveGlobalPolyfill`) needs the
          // inner Identifier. range stays on the original wrapper so the rewrite consumes
          // the whole `(Array)` span, not just `Array`
          const inner = peelFallbackWrappers(receiver);
          if (inner?.type !== 'Identifier') continue;
          const receiverPure = resolveGlobalPolyfill(inner.name);
          // lazy: `receiverSrc` is only consumed by non-polyfilled sibling props that need to
          // read off the original receiver. if every prop polyfilled independently, no read
          // happens and `injectPureImport` would leak a dead `_Promise` import into the bundle
          let receiverSrc = null;
          const getReceiverSrc = () => receiverSrc ??= receiverPure
            ? injectPureImport(receiverPure.entry, receiverPure.hintName)
            : inner.name;
          const entries = [];
          for (const p of objectPattern.properties) {
            if (p.type !== 'Property' || p.computed || p.key?.type !== 'Identifier') continue;
            const polyfill = polyfills.get(p.key.name);
            entries.push(polyfill
              ? `${ p.key.name }: ${ polyfill }`
              : `${ p.key.name }: ${ getReceiverSrc() }.${ p.key.name }`);
          }
          transforms.add(receiver.start, receiver.end, `{ ${ entries.join(', ') } }`);
        }
      }

      // three emission engines with overlapping logic - unification deferred because each
      // owns a distinct substrate:
      //   1. `applyDestructuringTransforms` - VariableDeclaration rewrite (splits, reorders, extracts)
      //   2. `applySynthSwaps` - function param default synth-swap
      //   3. `emitCatchClause` - catch-pattern rewrite
      // shared bits live in `emitPolyfilled` / `buildReplacement`; the entry points stay split
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
            const resolvedGlobalName = initIdentName || globalProxyMemberName(unwrapParens(info.initNode));
            // if remaining/rest/instance needs init object, ensure it's polyfilled
            if ((remaining.length > 0 || hasRest || hasInstance) && initTransformed === initSrc && resolvedGlobalName) {
              const initResolved = resolvePure({ kind: 'global', name: resolvedGlobalName }, null);
              if (initResolved) initTransformed = injectPureImport(initResolved.entry, initResolved.hintName);
            }
            const needsMemo = hasInstance && !resolvedGlobalName && (entries.length > 1 || remaining.length > 0 || hasRest);
            let objRef = initTransformed;
            if (needsMemo && initTransformed) {
              objRef = injector.generateLocalRef();
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
                  ? `${ injector.generateLocalRef() } = ${ initTransformed }`
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
        // symbol-sourced LHS (`Symbol.X in obj` / alias binding) takes the symbol-in
        // polyfill path; string-sourced LHS (`'Symbol.X' in Obj`) falls through to the
        // string-key lookup
        const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
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
            // marking only `node.right` leaves nested identifiers (`foo.bar.baz` -> `foo`)
            // visible to child visitors, which would emit spurious polyfill imports for
            // code the `'true'` replacement has already discarded
            walkAstNodes(node.right, n => skippedNodes.add(n));
            skipProxyGlobal(node.right);
          }
        }
      }

      // replace global identifier or static member with polyfill import binding. the
      // shorthand / export / super early-returns don't carry side effects (Identifier /
      // Super can't host a SequenceExpression); only the final MemberExpression replacement
      // wraps with `sideEffects` from the receiver / computed-key
      function replaceGlobalOrStatic(binding, node, parent, metaPath, sideEffects) {
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
        transforms.add(start, end, asiGuardLeadingParen(wrapSideEffects(binding, sideEffects), metaPath, start));
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

        let inheritedStatic = false;
        if (meta.kind === 'property') {
          if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
            return handleDestructuringPure(meta, metaPath, node);
          }
          if (node.type !== 'MemberExpression') return;
          if (isUpdateTarget(parent)) return;
          if (isForXWriteTarget(metaPath)) return;
          if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
          // shadow check for `this.X` - polyfill would bypass the user's own member
          if (node.object?.type === 'ThisExpression' && isShadowedByClassOwnMember(metaPath, meta.key)) return;
          // `super.X` and unshadowed `this.X` in static ctx resolve against the super
          // class's static surface via the same path - `this` in static ctx is the
          // constructor, so inherited static lookup behaves exactly like `super.X`.
          // cache the predicate so the instance-fallback bail below doesn't re-walk
          inheritedStatic = isInheritedStaticLookup(metaPath);
          if (inheritedStatic) {
            const inheritedMeta = resolveStaticInheritedMember(metaPath);
            if (!inheritedMeta) return;
            // `extends MyPromise` (user-aliased pure import) - map binding to global hint
            meta = resolveSuperImportName(injector, inheritedMeta);
          }
          if (isTaggedTemplateTag(parent, node, meta.placement)) return;
          if (meta.key === 'Symbol.iterator') return handleSymbolIterator(meta, node, parent, metaPath);
        }

        let { result: pureResult, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
        if (fallback && node.type === 'MemberExpression' && node.object?.type !== 'Super') {
          skipProxyGlobal(node);
          const binding = injectPureImport(fallback.entry, fallback.hintName);
          // deoptionalize: globalThis?.foo -> _globalThis.foo (polyfill import is always defined)
          const end = node.optional ? afterOptional(node.object.end, !node.computed) : node.object.end;
          transforms.add(node.object.start, end, binding);
          return;
        }
        // babel-compat: babel's AST mutation + deoptionalization re-visits outer members whose
        // ancestor chain got polyfilled. on that re-visit, the now-replaced ancestor's call
        // returns unknown type, so `resolvePropertyObjectType` yields null and `resolveHint`
        // lands on `desc.common`. text-based rewrite never mutates the AST, so the outer
        // sees its "correct" type-inferred primitive (e.g. 4-deep `.at` on a 3-deep array
        // resolves to `number` via element-tracking) - no matching desc variant, bail.
        // detect the equivalent scenario proactively. scope matches babel's re-visit reach:
        // only the OUTERMOST chain member gets the fallback - inner bailed members stay raw
        // the same way babel leaves them (avoids over-injection relative to babel's output)
        if (!pureResult && meta.kind === 'property' && node.type === 'MemberExpression'
          && !inheritedStatic && isOutermostOptionalChainMember(metaPath)) {
          const generic = resolvePureGeneric(meta, metaPath);
          if (generic) pureResult = generic;
        }
        if (!pureResult) return;
        const { entry: importEntry, kind, hintName } = pureResult;
        // inherited-static lookup (`super.X` / `this.X` in static ctx) where X has no static
        // on the super class - resolve() falls back to instance. for super: syntactically
        // invalid. for `this` in static ctx: `this` is the constructor, not an instance;
        // `_at(this)` would treat the class as an array. either way, bail
        if (kind === 'instance' && node.type === 'MemberExpression' && inheritedStatic) return;
        const binding = injectPureImport(importEntry, hintName);

        // mark proxy global (globalThis, self, etc.) as skipped to prevent
        // the Identifier visitor from adding an unused import
        if (node.type === 'MemberExpression') skipProxyGlobal(node);

        if (kind === 'instance' && node.type === 'MemberExpression') {
          replaceInstance(binding, node, parent, metaPath, meta.sideEffects);
        } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
          replaceGlobalOrStatic(binding, node, parent, metaPath, meta.sideEffects);
          // outer text-emit subsumes the receiver Identifier (e.g. `Symbol` in `(tag`hi`, Symbol).iterator`).
          // without seeding skippedNodes the identifier visitor queues a parallel `Symbol -> _Symbol`
          // transform whose needle composes into the outer's `_Symbol$iterator` replacement as
          // `__Symbol$iterator` (substring `Symbol` inside the outer's emit gets re-prefixed).
          // peels parens + SE-tail unconditionally - SE-prefix is preserved via `meta.sideEffects`,
          // so the receiver Identifier we want to suppress is at the deepest tail position
          if (node.type === 'MemberExpression') {
            const inner = unwrapInitValue(node.object);
            if (inner?.type === 'Identifier') skippedNodes.add(inner);
          }
        }
      };

      // pre-pass: detect declarations that WILL be fully flattened (every outer prop
      // resolvable as proxy-global shorthand or nested static method). the outer rewrite
      // discards the init span, so suppress handleIdentifier's `_globalThis` injection
      // for it - otherwise a now-dead import leaks into the final bundle
      traverse(ast, {
        $: { scope: true },
        VariableDeclaration(path) {
          for (const d of path.node.declarations) {
            if (d.init && canFullyConsumeProxyDeclarator(d, path.scope)) skippedNodes.add(d.init);
          }
        },
      });
      traverse(ast, mergeVisitors({
        $: { scope: true },
        Program(path) { injector.rootScope = path.scope; },
        ...createUsageVisitors({
          onUsage: usagePureCallback,
          onWarning: msg => debugOutput?.warn(msg),
          method,
          suppressProxyGlobals: true,
          walkAnnotations: false,
          isEntryAvailable: isEntryNeeded,
        }),
      }, pass === 'post' && inherit ? {
        Identifier(path) { injector.trackReferencedName(path.node.name); },
      } : {}));
      applySynthSwaps();
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
    // per-file snapshot invalidation. unplugin wrapper wires this to Vite/Rollup
    // `watchChange(id)` hook so a single file edit drops only its own snapshot
    // (not the whole cache). prevents unbounded growth in HMR sessions
    invalidateSnapshot(id) {
      snapshots.invalidate(id);
    },
  };
}
