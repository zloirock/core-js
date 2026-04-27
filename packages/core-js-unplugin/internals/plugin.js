import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import {
  createTypeAnnotationChecker,
  detectCommonJS,
  hasTopLevelESM,
  isDeleteTarget,
  isForXWriteTarget,
  isTaggedTemplateTag,
  isUpdateTarget,
  TS_EXPR_WRAPPERS,
  unwrapInitValue,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { createClassHelpers, resolveSuperImportName } from '@core-js/polyfill-provider/helpers/class-walk';
import { isCoreJSFile, stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import { buildOffsetToLine, mergeVisitors, parseDisableDirectives } from '@core-js/polyfill-provider/helpers/source-scan';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors, createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options';
import { enumerateFallbackDestructureBranches } from '@core-js/polyfill-provider/detect-usage/destructure';
import { resolveKey as sharedResolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage/annotations';
import { scanExistingCoreJSImports } from '@core-js/polyfill-provider/detect-usage/entries';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue from './transform-queue.js';
import detectEntries, { removeTopLevelStatement } from './detect-entry.js';
import { estreeAdapter, createUsageVisitors, createSyntaxVisitors } from './detect-usage.js';
import ScopeTracker from './scope-tracker.js';
import { isOutermostOptionalChainMember } from './emit-utils.js';
import { createPolyfillEmitter } from './polyfill-emitter.js';
import { createDestructureEmitter } from './destructure-emitter.js';
import {
  canFuseWithOpenParen,
  collectAllBindingNames,
  directivePrologueEnd,
  hasCoreJSPureImport,
  isBodylessStatementBody,
  isDirectiveStatement,
  KNOWN_BUNDLERS,
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
    // late-bound: debugOutput is constructed below (after createPolyfillResolver), but the
    // injector needs it for fallback warnings inside `flush()`. lazy getter avoids TDZ
    const injector = new ImportInjector({
      ms, pkg, mode, absoluteImports, importStyle,
      directiveEnd: directivePrologueEnd(ast),
      deferImports,
      inherit,
      getDebugOutput: () => debugOutput,
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
      const transforms = new TransformQueue(code, ms, id);

      // per-traversal scope state for `var _ref;`-style refs. setScope() runs before each
      // callback; genRef() reads the current scope. applyTransforms() drains accumulated
      // arrow / scoped vars after the traverse pass. instance + destructure emitters both
      // read scope position + allocate refs through this single tracker
      const scopeTracker = new ScopeTracker({ code, injector });

      // resolve a bare global name (`Array`, `Promise`, `globalThis`) to its pure polyfill
      // binding info; null when not polyfillable as a global. shared between the polyfill
      // emitter and the destructure emitter
      function resolveGlobalPolyfill(name) {
        const pure = resolvePure({ kind: 'global', name });
        return pure && pure.kind !== 'instance' ? pure : null;
      }

      // polyfill emission pipeline. covers all kinds dispatched from the usage-pure visitor:
      // instance-method member-calls (with optional-chain handling, Symbol.iterator special
      // path, receiver-polyfill substitution, chain composition), global / static member
      // rewrites, and `in` expression rewrites. factory in `internals/polyfill-emitter.js`
      // captures the closure deps below; public entries become local consts so existing
      // call sites stay unchanged
      const emitter = createPolyfillEmitter({
        canFuseWithOpenParen,
        code,
        estreeAdapter,
        injectPureImport,
        isEntryNeeded,
        NEEDS_GUARD_PARENS,
        NO_REF_NEEDED,
        resolveGlobalPolyfill,
        resolvePureOrGlobalFallback,
        scopeTracker,
        skippedNodes,
        startsEnclosingStatement,
        transforms,
      });
      const {
        afterOptional,
        handleInExpression,
        handleSymbolIterator,
        nodeSrc,
        replaceGlobalOrStatic,
        replaceInstance,
        skipProxyGlobal,
      } = emitter;

      // destructure-rewrite pipeline (parameter-default synth-swap, top-level VariableDecl
      // extraction, catch-clause rewrite, per-branch fallback synth-swap, nested proxy-global
      // flatten `const {Array:{from}} = globalThis` -> `const from = _Array$from`). factory
      // in `internals/destructure-emitter.js` captures the closure deps below; public methods
      // become local consts so existing call sites stay unchanged. pending-collection Maps
      // for destructuring + synth-swap are factory-internal (drained via the public methods)
      const destructureEmitter = createDestructureEmitter({
        estreeAdapter,
        injectPureImport,
        injector,
        isBodylessStatementBody,
        nodeSrc,
        resolveGlobalPolyfill,
        resolvePure,
        scopeTracker,
        skippedNodes,
        transforms,
      });
      const {
        applyDestructuringTransforms,
        applySynthSwaps,
        canFullyConsumeProxyDeclarator,
        handleDestructuringPure,
      } = destructureEmitter;

      const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

      const usagePureCallback = (meta, metaPath) => {
        if (isDisabled(metaPath.node)) return;
        if (skippedNodes.has(metaPath.node)) return;
        // see babel-plugin `usagePureCallback` - `<_Map/>` would invoke polyfill as a component
        if (metaPath.node?.type === 'JSXIdentifier') return;
        if (isInTypeAnnotation(metaPath)) return;
        scopeTracker.setScope(metaPath);
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
      scopeTracker.applyTransforms(transforms);
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
