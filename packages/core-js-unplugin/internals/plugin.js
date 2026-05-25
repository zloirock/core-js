import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import {
  collectMutatedStaticMembers,
  forEachStatementListBody,
  getMinifierSequenceDestructureExpressions,
  createTypeAnnotationChecker,
  detectCommonJS,
  hasTopLevelESM,
  isDeleteTarget,
  isForXWriteTarget,
  isMemberWriteOnlyContext,
  isMutatedStaticMeta,
  isTaggedTemplateTag,
  isThisReceiver,
  isUpdateTarget,
  peelSkippableWrappers,
  TS_EXPR_WRAPPERS,
  unwrapReceiverLeaf,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { createClassHelpers, remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import { tagError } from '@core-js/polyfill-provider/helpers/error-tag';
import { isCoreJSFile, stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import {
  buildOffsetToLine,
  buildOffsetToLineColumn,
  mergeVisitors,
  parseDisableDirectives,
} from '@core-js/polyfill-provider/helpers/source-scan';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors } from '@core-js/polyfill-provider/plugin-options/inject';
import { createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options/usage-callback';
import { enumerateFallbackDestructureBranches } from '@core-js/polyfill-provider/detect-usage/destructure';
import { resolveKey as sharedResolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage/annotations';
import { scanExistingCoreJSImports } from '@core-js/polyfill-provider/detect-usage/entries';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue from './transform-queue.js';
import detectEntries, { createTopLevelStatementRemover } from './detect-entry.js';
import { createEstreeAdapter, createUsageVisitors, createSyntaxVisitors } from './detect-usage.js';
import ScopeTracker from './scope-tracker.js';
import { isOutermostOptionalChainMember } from './emit-utils.js';
import { createPolyfillEmitter } from './polyfill-emitter.js';
import { createDestructureEmitter } from './destructure-emitter.js';
import {
  canFuseWithOpenParen,
  collectAllBindingNames,
  directivePrologueEnd,
  hasCoreJSImport,
  isBodylessStatementBody,
  isChunkLoaderBundler,
  isDirectiveStatement,
  KNOWN_BUNDLERS,
  lastUserImportEnd,
  liftSfcLangSuffix,
  NEEDS_GUARD_PARENS,
  NO_REF_NEEDED,
  startsEnclosingStatement,
  stripLeadingBOMs,
} from './plugin-helpers.js';
import SnapshotCache from './snapshot-cache.js';

// estree-toolkit's scope crawler walks `RestElement` params via the reference path on three
// type-only shapes (`TSDeclareFunction`, `TSEmptyBodyFunctionExpression`, `TSMethodSignature`)
// where it throws `This should be handled by findVisiblePathsInPattern`.
// `TSDeclareFunction` retypes to a body-bearing `FunctionDeclaration` so the standard pattern
// walker handles params; the other two have no body slot, so rest params get rewritten to a
// bare Identifier carrying the original `typeAnnotation` (`Parameters<typeof X>` still resolves
// the original `T[]` element type). Touching only rest-bearing params leaves `es.function.name`
// injection on regular declares unaffected
const REST_CRASHING_SHAPES = new Set([
  'TSDeclareFunction',
  'TSEmptyBodyFunctionExpression',
  'TSMethodSignature',
]);

function neutralizeTSDeclareFunctions(node) {
  if (!node || typeof node !== 'object') return;
  if (REST_CRASHING_SHAPES.has(node.type) && node.params?.some(p => p?.type === 'RestElement')) {
    if (node.type === 'TSDeclareFunction') {
      node.type = 'FunctionDeclaration';
      node.body = { type: 'BlockStatement', body: [], start: node.end, end: node.end };
    } else for (let i = 0; i < node.params.length; i++) {
      const p = node.params[i];
      if (p?.type !== 'RestElement') continue;
      node.params[i] = {
        type: 'Identifier',
        name: p.argument?.name ?? '_rest',
        typeAnnotation: p.typeAnnotation,
        start: p.start,
        end: p.end,
      };
    }
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) neutralizeTSDeclareFunctions(child);
    return;
  }
  for (const key of Object.keys(node)) neutralizeTSDeclareFunctions(node[key]);
}

// 1-based `line:col` from oxc's first label via shared offset->line+column helper.
// null when label.start is missing or out of range so the caller can skip the location chunk
export function formatLabelLocation(label, code) {
  const pos = buildOffsetToLineColumn(code)(label?.start);
  return pos && `${ pos.line }:${ pos.column }`;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.length ? value : null;
}

// minifier-shape pre-pass: `(prefixExpr, ..., ({pat} = R));` collapses a destructure
// assignment into the SequenceExpression tail. the destructure-emitter gate peels only
// Paren+TS so this shape silently bails. rewrite the ExpressionStatement's
// SequenceExpression body as consecutive `;`-terminated statements in source text so
// the standard destructure flow handles the inner assignment. side-effecting prefix
// expressions stay in source order as preceding statements
// shape detection shared with babel-plugin's `splitMinifierSequenceDestructure` pre-pass via
// `getMinifierSequenceDestructureExpressions`. unplugin can't use babel's AST-level mutation
// here (oxc AST positions must stay valid for downstream MagicString edits), so we rewrite
// the text instead and re-parse the result. walks Program body AND every descendant
// Statement-list host (BlockStatement / TSModuleBlock / StaticBlock) via the shared
// `forEachStatementListBody` so function / loop / try / namespace bodies are covered too;
// Program-only walk silently bailed destructure-emitter inside non-Program statement lists
function applyMinifierSequenceSplit(code, ast) {
  let mutated = null;
  forEachStatementListBody(ast, statements => {
    for (const stmt of statements) {
      const expressions = getMinifierSequenceDestructureExpressions(stmt);
      if (!expressions) continue;
      const splitText = expressions.map(e => `${ code.slice(e.start, e.end) };`).join('\n');
      if (!mutated) mutated = new MagicString(code);
      mutated.overwrite(stmt.start, stmt.end, splitText);
    }
  });
  return mutated ? mutated.toString() : null;
}

// codeframe is preferred (ASCII pointer with line:col baked in); labels are the fallback so
// a bundler-less caller still sees WHERE the syntax broke. helpMessage tails both paths
function buildParseErrorBody(error, code) {
  const tail = nonEmptyString(error.helpMessage);
  const codeframe = nonEmptyString(error.codeframe);
  if (codeframe) return tail ? `${ codeframe }\n${ tail }` : codeframe;
  const label = error.labels?.[0];
  const chunks = [];
  if (label) {
    const loc = formatLabelLocation(label, code);
    if (loc) chunks.push(`at ${ loc }`);
    const msg = nonEmptyString(label.message);
    if (msg) chunks.push(msg);
  }
  if (tail) chunks.push(tail);
  return chunks.join('\n');
}

function combineHeadAndBody(head, body) {
  return body ? `${ head }\n${ body }` : head;
}

// warn-path: bundler's `this.warn` hook receives the message standalone, so the `[core-js]`
// prefix lives inline
export function formatParseErrorForWarn({ id, error, code }) {
  return combineHeadAndBody(`[core-js] could not parse ${ id }: ${ error.message }`, buildParseErrorBody(error, code));
}

// throw-path: bundler-less callers rely on `runTransform`'s outer catch to stamp
// `[core-js] [${ id }]` via `tagError`. self-prefixing would double-up the tag
export function formatParseErrorForThrow({ error, code }) {
  return combineHeadAndBody(`could not parse: ${ error.message }`, buildParseErrorBody(error, code));
}

// legacy entry kept for tests that exercise the flag dispatch; new callers pick the named helper
export function formatParseErrorMessage({ id, error, code, withCoreJSPrefix }) {
  return withCoreJSPrefix
    ? formatParseErrorForWarn({ id, error, code })
    : formatParseErrorForThrow({ error, code });
}

export default function createPlugin(options) {
  // per-instance type resolvers - guardsCache/resolveCache WeakMaps don't leak across
  // plugin instances. shared between transforms WITHIN one instance is safe because
  // Node.js JS is single-threaded; Vite/Rollup contracts serialize transforms per plugin.
  // genuine parallelism (worker_threads, parallel test runs) instantiates separate plugins
  // so each gets its own typeResolvers - no cross-worker mutation race.
  // `currentInjector` is the active per-transform injector, owned by this plugin instance
  // (not module-global). runTransformInner save/restore the slot via try/finally so a
  // re-entrant inner transform leaves the outer's injector intact. adapter and typeResolvers
  // share the same getter so they always see the same per-transform binding state.
  // contract: the save/restore (`previousInjector = currentInjector; ...; finally
  // { currentInjector = previousInjector; }`) is sync-only. async visitor callbacks would
  // observe the WRONG injector after their await point if introduced later - oxc is sync,
  // MagicString is sync, all current visitors are sync. enforce by inspection
  let currentInjector = null;
  const estreeAdapter = createEstreeAdapter(() => currentInjector);
  const typeResolvers = createResolveNodeType(nodeType, types, {
    getPolyfillBindingEntry: (scope, name) => currentInjector?.getBindingInfo?.(name)?.entry ?? null,
    getPolyfillBindingHint: (scope, name) => currentInjector?.getBindingInfo?.(name)?.hint ?? null,
    isReassignedBinding: name => currentInjector?.isReassignedBinding?.(name) ?? false,
  });

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
      // peel parens + TS expression wrappers from `parent.callee` before identity-checking
      // against `node`. without the peel, the resolver's `filter()` walks through wrappers
      // to find the outer Call but then this identity check fails (parent.callee is the
      // wrapper, not the inner MemberExpression), arg-count / arg-shape filters silently
      // over-inject. shared `peelSkippableWrappers` also handles ChainExpression which oxc
      // emits around optional chains (`(obj?.fn)()`)
      isCallee: (node, parent) => {
        if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return false;
        return peelSkippableWrappers(parent.callee) === node;
      },
      isSpreadElement: node => node?.type === 'SpreadElement',
    },
  });

  const { method, absoluteImports, importStyle: importStyleOption } = providerOptions;
  const {
    mode, pkg, packages, getModulesForEntry, getCoreJSEntry, isEntryNeeded,
    resolveUsage, resolvePure, resolvePureGeneric, resolvePureOrGlobalFallback,
  } = resolver;
  // `isWebpack` here is a behavior flag for the chunk-loader contract (see
  // `isChunkLoaderBundler` for the bundler set + rationale)
  const isWebpack = isChunkLoaderBundler(bundler);

  function runTransform(code, id, pass = 'single') {
    try {
      // thread bundler's `this` (Vite/Rollup/Webpack stage context with `.warn`) through
      // to runTransformInner so internal warnings reach the bundler's diagnostic channel.
      // injector save/restore happens INSIDE runTransformInner so early-returns before
      // its installation point don't disturb a re-entrant outer transform's slot
      return runTransformInner.call(this, code, id, pass);
    } catch (error) {
      tagError(error, id);
      throw error;
    }
  }

  // pipeline orchestrator: shared pre-amble (parse, injector setup, scan, orphan adoption,
  // module-injector wiring, finalize closure) then mode dispatch through inner functions
  // (`runEntryGlobal` / `runUsageGlobal` / `runUsagePure`) which close over the pre-amble
  // state. mode bodies kept as inner functions for closure sharing - extracting them to
  // top-level would force passing 12+ closures explicitly with no readability gain
  // eslint-disable-next-line max-statements -- pipeline orchestrator + mode dispatcher
  function runTransformInner(code, id, pass) {
    // defensive guard for direct callers (bundlers always pass valid strings)
    if (typeof code !== 'string' || typeof id !== 'string') return null;
    if (isCoreJSFile(id)) return null;
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
    // and reject the TypeScript syntax silently. SFC virtual ids embed the language hint
    // INSIDE the query (`?vue&type=script&lang=ts`); `liftSfcLangSuffix` recovers it onto
    // the post-strip id so the right parser fires
    const cleanId = liftSfcLangSuffix(id);
    // CJS files (.cjs, .cts) and files that look like CommonJS get 'require' style by default
    const isCJSFile = /\.c[jt]s$/.test(cleanId);
    // strip leading BOM(s) before parsing AND from the MagicString source - oxc rejects
    // BOM-prefixed shebangs, and offsetting positions by 1 would corrupt every transform.
    // a single BOM is re-prepended to the final output. Reassign `code` so the rest of
    // the function (TransformQueue, skipGap, slice helpers, ...) AND the post-pass cache
    // comparison use the BOM-stripped source (stored `postInput` is always BOM-stripped).
    // `stripLeadingBOMs` drops the whole leading run so a sibling plugin's per-pass
    // re-prepend on top of ours doesn't leave residual BOM bytes mid-prefix
    const hasBOM = code.charCodeAt(0) === 0xFEFF;
    code = stripLeadingBOMs(code);

    // peek-then-commit: read snapshot WITHOUT removing it so a sibling-plugin-injected
    // `// core-js-disable-file` directive between pre and post (caught by `parseDisableDirectives`)
    // can bail without leaking pre's deferred imports. `snapshots.take(id)` commits only AFTER
    // the disable check passes - bail paths leave the snapshot intact for a subsequent retry.
    // `peekWithParse` encapsulates parse-cache reuse gating (sibling text mutation requires
    // `postInput === code` byte-equality for AST position fidelity)
    if (pass === 'post') {
      const stored = snapshots.peekWithParse(id, code);
      inherit = stored.snapshot;
      cachedAst = stored.ast;
      cachedComments = stored.comments;
    }
    let ast;
    let comments;
    if (cachedAst) {
      ast = cachedAst;
      comments = cachedComments;
    } else {
      // reset `typeResolvers`' AST-keyed WeakMap caches only when we're about to parse
      // a FRESH AST. when the pre-pass cached the AST for post-reuse, its WeakMap
      // entries are still valid - clearing them wastes a per-file warm-up. `createClassHelpers`
      // is per-transform-fresh below; only the persistent resolver needs clearing here.
      // moved below `cachedAst` resolution so the reset is gated correctly
      typeResolvers.reset();
      // parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const parsed = parseSync(cleanId, code, { sourceType: isCJSFile ? 'script' : 'module' });
      const [fatal] = parsed.errors?.filter(e => e.severity === 'Error') ?? [];
      if (fatal) {
        // emit a tagged breadcrumb so the user knows core-js saw the bad source first.
        // bundler-less callers (esbuild post-resolve adapter, bun, direct tests) have no
        // `warn` hook - throw so the breadcrumb propagates instead of silently dropping the file
        if (typeof this?.warn !== 'function') throw new Error(formatParseErrorForThrow({ error: fatal, code }));
        this.warn(formatParseErrorForWarn({ id, error: fatal, code }));
        return null;
      }
      ast = parsed.program;
      comments = parsed.comments;
    }

    // minifier-shape pre-pass: rewrite `(prefix, ..., destructure);` shapes into
    // `prefix; ... ; destructure;` consecutive statements before any visitor walks the
    // tree. re-parse so the rewritten text and AST positions line up. failure to reparse
    // (shouldn't happen given the initial parse already validated the source) falls back
    // to the original code+ast and the destructure-emitter gate continues to silently bail
    let preSplitCode = null;
    const splitCode = applyMinifierSequenceSplit(code, ast);
    if (splitCode) {
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const reparsed = parseSync(cleanId, splitCode, { sourceType: isCJSFile ? 'script' : 'module' });
      const [reparseFatal] = reparsed.errors?.filter(e => e.severity === 'Error') ?? [];
      if (!reparseFatal) {
        preSplitCode = code;
        code = splitCode;
        ast = reparsed.program;
        comments = reparsed.comments;
        typeResolvers.reset();
      }
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
    const disabledLines = parseDisableDirectives({ comments, offsetToLine, firstStmtStart: firstNonDirective?.start, ast });
    if (disabledLines === true) return null; // entire file disabled
    // commit the peeked snapshot now that disable-check passed. the entire-file-disabled bail
    // and the fatal-parse bail both keep the snapshot in cache so a retry (sibling-plugin re-
    // emit, watchChange re-run) can still consume it - `take()` only after both checks pass
    if (pass === 'post') snapshots.take(id);

    function isDisabled(node) {
      if (!disabledLines) return false;
      if (node.start === undefined) return false;
      return disabledLines.has(offsetToLine(node.start));
    }

    // pre-walk for `Object.key` monkey-patches. cheap single AST traversal; result consulted
    // by `usagePureCallback` before substituting matching property reads. the polyfill import
    // is a `const` binding - user's mutation reaches the original global but not the import,
    // so substituting reads after a `[Array.from] = X` / `Array.from = X` would silently
    // diverge from the un-transformed source's behavior. usage-global is unaffected (polyfill
    // installs on the same global slot, user's mutation overlays cleanly)
    const mutatedStatics = method === 'usage-pure' ? collectMutatedStaticMembers(ast) : null;

    const ms = new MagicString(code, { filename: id });
    // late-bound: debugOutput is constructed below (after createPolyfillResolver) but the
    // injector closes over it for fallback warnings inside `flush()`. hoist above the try
    // block so the lazy getter sees the same binding the later assignment populates
    let debugOutput = null;
    const injector = new ImportInjector({
      ms, pkg, packages, mode, absoluteImports, importStyle,
      directiveEnd: directivePrologueEnd(ast),
      userImportEnd: lastUserImportEnd(ast),
      deferImports,
      inherit,
      getDebugOutput: () => debugOutput,
    });
    // typeResolvers' `getPolyfillBindingEntry` AND estreeAdapter's `polyfillHint` both
    // close over the plugin instance's `currentInjector` slot. save/restore via try/finally
    // (closing at runTransformInner's tail) so a re-entrant inner transform leaves the
    // outer's injector intact - the early-return guards above (typeof/isCoreJSFile/
    // disable-file/parse-fail) run BEFORE the save and never touch the slot. cross-transform
    // AST node identity won't carry through (ASTs differ per transform), so resolver's
    // WeakMap caches don't observe the swap. `import _Promise from '.../constructor';
    // _Promise.resolve(1)` recognises `_Promise` as a proxy-global for the Promise
    // constructor and rewrites to `_Promise$resolve(1)` (matches babel adapter behavior)
    const previousInjector = currentInjector;
    currentInjector = injector;
    try {
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
      if (pass === 'post' && !inherit && hasCoreJSImport(ast, packages)) {
        const adoptable = new Set();
        for (const ref of orphanRefs) if (!declaredNames.has(ref)) adoptable.add(ref);
        injector.adoptOrphanRefs(adoptable);
      }
      // entry-global handles re-emit via detectEntries - skip there. otherwise scan
      // unconditionally: post-with-inherit ALSO needs this because a sibling plugin
      // may have INJECTED new core-js imports between our pre and post (sibling preset
      // adding `import 'core-js/modules/X'` for a transform it generated). pre's snapshot
      // captured user imports as of pre-time; sibling-inserted ones arrive AFTER and
      // would slip past dedup if we trusted inherit alone. re-running scan re-registers
      // them safely - the injector's dedup filter ignores already-registered entries
      if (method !== 'entry-global') {
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
          const removeStatement = createTopLevelStatementRemover(ms);
          for (const node of removed) removeStatement(node);
        }
      }
      // post drops pure imports whose binding isn't referenced - sibling may have deleted
      // the usage between pre and post. enable for every post pass, not just `inherit`:
      // single-post (no pre snapshot, e.g. `phase: 'post'` without `pre`) can still emit
      // dead imports when a destructure transform drops all uses mid-pass, and the ref-tracking
      // overhead is negligible. babel-plugin doesn't call this - it resolves destructure
      // transforms synchronously during traversal. SINGLE source of truth: shared by both
      // `enableReferenceTracking()` activation here AND the usage-pure Identifier visitor mount
      // in `runUsagePure`. drift in either gate's predicate would leak ALL pure imports per
      // `pruneUnusedRefs`' dead-import filter (no Identifier ever fires `trackReferencedName`)
      const trackReferences = pass === 'post';
      if (trackReferences) injector.enableReferenceTracking();

      debugOutput = createDebugOutput?.() ?? null;

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
        // `outputDebug` prints the debug report to stdout. in `phase: 'pre+post'` mode
        // `finalize` fires twice per file - emitting the report from both passes would
        // double-print every diagnostic. only post / single / entry-global emits; pre
        // stores its work in the snapshot and the post phase carries the union. parity
        // with babel-plugin's `outputDebug` deferral to `postHook`
        if (pass !== 'pre') outputDebug();
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
        // post's snapshot delete happens at the top of runTransform (via `takeWithParse`)
        // so it runs even on early-return paths (parse error, disabled directive). the
        // `isCoreJSFile` check runs BEFORE the snapshot is taken, so its early-return
        // doesn't need cleanup - the snapshot was never claimed
        if (!ms.hasChanged()) return null;
        // re-prepend BOM through MagicString so the sourcemap's output columns on line 0
        // account for the extra char (external string concat would leave mappings claiming
        // output[0,0] -> source[0,0] while the real output[0,0] is the BOM). gated on
        // hasChanged so no-op transforms still return null
        if (hasBOM) ms.prepend('\uFEFF');
        // pre+post `pass='post'` with `inherit`: `ms.original` is pre-output, not real source -
        // omit sourcesContent so the bundler chains through pre-pass map's content. standalone
        // `phase: 'post'` (no inherit) operates on the raw source, so content must be emitted
        const chainedFromPre = pass === 'post' && !!inherit;
        // `file` field is optional per spec but devtools and downstream chain consumers (e.g.
        // bundler `combineSourceMaps`) rely on it for output filename hints; emit it on both
        // pre and post passes so the chain stays self-describing.
        // `source` (full id) and `file` (basename) must differ - MagicString's
        // `getRelativePath` collapses `sources[0]` to the basename when both equal, dropping
        // dirname for every file. devtools / `combineSourcemaps` then can't distinguish
        // files with the same basename in different dirs. patch `file` to basename so
        // `sources[0] === id` survives in the emitted map
        // strip Vite SFC virtual-id query (`App.vue?vue&type=script&lang=ts` -> `App.vue`)
        // before basename extraction; otherwise devtools show the filename with the full
        // query string attached, which is noise rather than signal for the user
        const fileName = stripQueryHash(id).split(/[/\\]/).pop() || id;
        // `storeName: true` populates `map.names` with the original identifier text at each
        // mapping that has a renamed segment (MagicString tracks renames via overwrite calls).
        // without it, devtools can't reverse-resolve `_at(arr)` back to `arr.at` for symbol
        // names in stack traces / breakpoints.
        // `source` keeps the FULL `id` (including SFC `?vue&type=...` query / hash): each
        // SFC sub-block is its own virtual module with a distinct id and downstream
        // bundler chaining must see them as separate sources. stripping the query would
        // collapse sibling blocks to the same path and lose block identity in the chain
        const map = ms.generateMap({
          source: id, file: fileName, includeContent: !chainedFromPre, hires: 'boundary', storeName: true,
        });
        // restore BOM in sourcesContent so devtools show the file with its on-disk byte
        // count. MagicString's `prepend` updates the output but the original source it
        // captured for `sourcesContent` is the BOM-stripped slice we passed in. only ONE
        // BOM is restored - even if the source had multi-BOM (rare / malformed), the
        // canonical on-disk form has a single BOM
        if (hasBOM && map?.sourcesContent?.[0] && map.sourcesContent[0].charCodeAt(0) !== 0xFEFF) {
          map.sourcesContent[0] = `\uFEFF${ map.sourcesContent[0] }`;
        }
        // pre-pass split rewrites the transform input internally; sourcesContent must reflect
        // the user's ORIGINAL file (before split), not the post-split scratch buffer the rest
        // of the pipeline operates on. devtools / chain consumers + sourcemap-validation
        // tooling check sourcesContent against the on-disk source - the runner's own
        // validity check enforces this contract.
        // INTENTIONAL TRADE-OFF: mappings still anchor at splitCode positions while
        // sourcesContent is preSplitCode. for the rare minifier-shape input where the split
        // fires, a line-offset drift in devtools is the cost of keeping sourcesContent ==
        // input. proper fix (compose split-pass map with post-pass map via
        // @jridgewell/remapping) requires a new direct dep - deferred until the
        // observable surface (minifier output rarely consumed with sourcemaps) widens
        if (preSplitCode !== null && map?.sourcesContent?.[0]) {
          map.sourcesContent[0] = hasBOM ? `\uFEFF${ preSplitCode }` : preSplitCode;
        }
        return {
          code: ms.toString(),
          map,
        };
      }

      // entry-global mode: replace `import 'core-js'` with resolved modules
      function runEntryGlobal() {
        const entryFound = detectEntries(ast, {
          adapter: estreeAdapter,
          getCoreJSEntry,
          injectModulesForEntry,
          isDisabled,
          ms,
        });
        if (entryFound) debugOutput?.markEntryFound();
        return finalize();
      }
      if (method === 'entry-global') return runEntryGlobal();

      const {
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isShadowedByClassOwnMember,
      } = createClassHelpers({ t: types, adapter: estreeAdapter, resolveKey: sharedResolveKey, getInjector: () => injector });

      // usage-global mode
      function runUsageGlobal() {
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
          adapter: estreeAdapter,
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
      if (method === 'usage-global') return runUsageGlobal();

      // usage-pure mode
      function runUsagePure() {
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
          handleInExpression,
          handleSymbolIterator,
          nodeSrc,
          replaceGlobalOrStatic,
          replaceInstance,
          replaceStaticFallback,
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

        // true when `inner`'s source range sits inside any sideEffects subtree - the outer
        // text-emit re-emits that subtree verbatim via `wrapSideEffects`, so `inner` survives
        // in the output and must NOT be suppressed from its own polyfill substitution.
        // sideEffects nodes always have `.start` / `.end` populated (parser-provided AST nodes),
        // so the bounds check is reliable; falsy sideEffects (empty list / undefined) short-circuit
        function innerPreservedBySideEffects(inner, sideEffects) {
          return !!sideEffects?.some(se => se.start <= inner.start && inner.end <= se.end);
        }

        const usagePureCallback = (meta, metaPath) => {
          // bundle early-return gates: disable directives + already-handled nodes + JSX
          // identifiers (`<_Map/>` would call the polyfill as a React component) +
          // type-annotation positions + monkey-patched statics. the last gate consults the
          // pre-pass mutation set: substituting reads with the `const`-bound polyfill import
          // would silently bypass user's `Array.from = X` / `[Array.from] = X` (unlike
          // usage-global which shares the global slot - mutation overlays the polyfill there)
          if (isDisabled(metaPath.node) || skippedNodes.has(metaPath.node)
            || metaPath.node?.type === 'JSXIdentifier'
            || isInTypeAnnotation(metaPath) || isMutatedStaticMeta(meta, mutatedStatics)) return;
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
            // any AssignmentExpression LHS - including compound (`obj.at += X`, `obj.at ||= X`).
            // compound reads the LHS too, so the read could be polyfilled, but the write would
            // hit the const polyfill binding. bail conservatively to keep both halves consistent
            if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
            // shared write-context check: covers default-pattern destructure (`{a: obj.at = 1}`),
            // array-pattern destructure (`[obj.at] = src`), AND the assignment-target shape
            // parsers emit as ArrayExpression (`[super.from] = src`). without this gate,
            // `[super.from] = [...]` would rewrite `super.from` to the polyfill import (a frozen
            // binding), causing "Assignment to constant variable" at runtime
            if (isMemberWriteOnlyContext(node, parent, metaPath.parentPath?.parent)) return;
            // shared `isThisReceiver` peels parens / TS wrappers / chain so `(this).at(0)`,
            // `(this as any).at(0)`, `this!.at(0)` reach the same shadow detection
            if (isThisReceiver(node.object) && isShadowedByClassOwnMember(metaPath, meta.key)) return;
            // `super.X` and unshadowed `this.X` in static ctx resolve against the super
            // class's static surface via the same path - `this` in static ctx is the
            // constructor, so inherited static lookup behaves exactly like `super.X`.
            // cache the predicate so the instance-fallback bail below doesn't re-walk
            inheritedStatic = isInheritedStaticLookup(metaPath);
            if (inheritedStatic) {
              meta = remapInheritedStaticMeta(injector, meta, resolveStaticInheritedMember(metaPath));
              if (!meta) return;
              // re-check mutation gate AFTER remap: the pre-remap meta.object was null for
              // this-receiver kind='property'; remap fills it with the super class name.
              // without the re-check, `this.from(arr)` inside `class C extends Array`
              // silently bypasses user's `Array.from = ...` monkey-patch
              if (isMutatedStaticMeta(meta, mutatedStatics)) return;
            }
            if (isTaggedTemplateTag(parent, node, meta.placement)) return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator({
              node, parent, metaPath, sideEffects: meta.sideEffects,
            });
          }

          let { result: pureResult, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
          // inherited-static lookup (`this.X()` in static block of `class C extends Y`) has
          // already been retargeted to `Y`-static-meta above. when `Y` has no static `X`,
          // resolvePure misses and the global fallback fires - rewriting `this` to `_Y` would
          // silently change runtime semantics (`this` is the dynamic constructor, `_Y` is the
          // import binding). babel bails the same way; gate the fallback to keep parity
          if (fallback && node.type === 'MemberExpression'
          && node.object?.type !== 'Super' && !inheritedStatic) {
            skipProxyGlobal(node);
            const binding = injectPureImport(fallback.entry, fallback.hintName);
            // fallback fires for non-proxy-global polyfilled idents (`Promise?.foo`, `Map?.x`);
            // proxy-global resolver gate excludes them from this branch. preserve user's `?.`
            // even though `_Promise` is always defined post-import - parity with babel-plugin's
            // emit (`_Promise?.foo` rather than `_Promise.foo`) keeps the user-written deopt
            // shape intact. proxy-global path (replaceGlobalOrStatic) does strip `?.` since the
            // polyfill renames the proxy itself, the user-visible chain has no surface there.
            // `replaceStaticFallback` mirrors babel-plugin's `withSideEffects(id, allEffects)`
            // shape: preserves receiver `meta.sideEffects` + chain-assignment so
            // `(called++, Promise).noSuchStatic` keeps the `called++` rather than dropping it
            replaceStaticFallback({ binding, node, metaPath, sideEffects: meta.sideEffects });
            // outer text-emit absorbs the whole receiver: any inner Identifier whose name
            // matches the polyfill's substitution would compose into the emit (`_Map` substring
            // inside the outer's `_Map` -> `__Map`). peel through wrappers + IIFE shells to find
            // the effective receiver leaf and mark it skipped before the Identifier visitor runs
            const inner = unwrapReceiverLeaf(node.object);
            if (inner?.type === 'Identifier') skippedNodes.add(inner);
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

          // proxy-global suppression is dispatch-conditional. instance dispatch leaves the
          // receiver Identifier live so its substitution composes into the outer guard's
          // rootRaw slot (`_globalThis.foo` instead of `globalThis?.foo` in the memo'd guard).
          // static dispatch already swallows the receiver in its own emit, so suppress the
          // parallel identifier transform (its needle wouldn't compose anyway and the
          // injected import would be filtered as dead by reference tracking, but skipping
          // saves a wasted transform allocation)
          if (node.type === 'MemberExpression' && kind !== 'instance') skipProxyGlobal(node);

          if (kind === 'instance' && node.type === 'MemberExpression') {
            replaceInstance({ binding, node, parent, metaPath, sideEffects: meta.sideEffects });
          } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
            replaceGlobalOrStatic({ binding, node, parent, metaPath, sideEffects: meta.sideEffects });
            // outer text-emit subsumes the receiver Identifier (e.g. `Symbol` in `(tag`hi`, Symbol).iterator`):
            // without skippedNodes the identifier visitor queues a parallel `Symbol -> _Symbol` whose
            // needle composes into the outer's `_Symbol$iterator` replacement as `__Symbol$iterator`
            // (substring `Symbol` inside the outer's emit gets re-prefixed).
            // `unwrapReceiverLeaf` peels parens / SE-tail / TS wrappers / chain wrappers AND no-arg
            // arrow / fn IIFE shells (`(() => Symbol)?.()`) so the receiver Identifier we want to
            // suppress is reached through any combination of transparent wrappers.
            // exception: when the leaf lives INSIDE a sideEffect subtree (`meta.sideEffects = [IIFE]`
            // for an inline-call receiver with observable prefix), the outer emit RE-EMITS that
            // subtree verbatim via `wrapSideEffects` - the inner text survives in the output and
            // must still receive its own polyfill substitution. SE-tail receivers (`(foo(), Symbol)`)
            // carry only the preceding expressions in sideEffects, NOT the receiver subtree, so
            // the leaf is dropped from the output text and suppression still applies
            if (node.type === 'MemberExpression') {
              const inner = unwrapReceiverLeaf(node.object);
              if (inner?.type === 'Identifier' && !innerPreservedBySideEffects(inner, meta.sideEffects)) {
                skippedNodes.add(inner);
              }
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
            adapter: estreeAdapter,
            onUsage: usagePureCallback,
            onWarning: msg => debugOutput?.warn(msg),
            method,
            suppressProxyGlobals: true,
            walkAnnotations: false,
            isEntryAvailable: isEntryNeeded,
          }),
        }, trackReferences ? {
        // mount tracker for every post pass (parity with `injector.enableReferenceTracking()`
        // gate above): standalone `phase: 'post'` without a pre-pass snapshot also needs
        // `referencedInSource` populated, otherwise `pruneUnusedRefs`'s dead-import filter
        // strips ALL pure imports because no Identifier ever calls `trackReferencedName`
          Identifier(path) { injector.trackReferencedName(path.node.name); },
        } : {}));
        applySynthSwaps();
        applyDestructuringTransforms();
        scopeTracker.applyTransforms(transforms);
        return finalize();
      }
      if (method === 'usage-pure') return runUsagePure();

      return null;
    } finally {
      currentInjector = previousInjector;
    }
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
