import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import {
  namespaceScopedBindingBlock,
  staticFallbackSwapRedundant,
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
  mayHaveSideEffects,
  peelNestedSequenceExpressions,
  peelToExpressionStatement,
  TS_EXPR_WRAPPERS,
  unwrapReceiverLeaf,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { enrichMutatedStatics } from '@core-js/polyfill-provider/detect-usage/mutation-prepass';
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
import { coreJSImportRemovalKeptCallee, scanExistingCoreJSImports } from '@core-js/polyfill-provider/detect-usage/entries';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue from './transform-queue.js';
import detectEntries, { createTopLevelStatementRemover } from './detect-entry.js';
import {
  pathContainedBy,
  withoutPhantomDeclarationViolations,
  collectMutationPrePass,
  createEstreeAdapter,
  createUsageVisitors,
  createSyntaxVisitors,
} from './detect-usage.js';
import ScopeTracker from './scope-tracker.js';
import { isCallee, isOutermostOptionalChainMember } from './emit-utils.js';
import { createPolyfillEmitter } from './polyfill-emitter.js';
import { createDestructureEmitter } from './destructure-emitter.js';
import {
  walkAstNodes,
  canFuseWithOpenParen,
  collectAllBindingNames,
  directivePrologueEnd,
  enclosingExpressionStatementPath,
  hasCoreJSImport,
  isBodylessStatementBody,
  isChunkLoaderBundler,
  isDirectiveStatement,
  KNOWN_BUNDLERS,
  lastUserImportEnd,
  liftSfcLangSuffix,
  NEEDS_GUARD_PARENS,
  parenthesizeExprStmtHazard,
  statementOverwriteFusesLeft,
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
  // a constructor parameter-property with a default (`constructor(public m = 1)`) parses as
  // `TSParameterProperty { parameter: AssignmentPattern }`; estree-toolkit's scope crawler has no
  // AssignmentPattern handler in that position and throws during crawl, aborting the whole file. a
  // plain AssignmentPattern param (no accessibility wrapper) crawls fine, so unwrap to the inner
  // pattern in place - the default expression survives (so usage inside it like `= new WeakMap()`
  // is still detected), and accessibility / readonly modifiers are irrelevant to polyfill detection
  if (node.type === 'TSParameterProperty' && node.parameter?.type === 'AssignmentPattern') {
    const inner = node.parameter;
    for (const key of Object.keys(node)) delete node[key];
    Object.assign(node, inner);
    neutralizeTSDeclareFunctions(node);
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

// minifier-shape pre-pass: `(prefixExpr, ..., ({pat} = R), ...);` collapses a destructure
// assignment into ANY slot of a statement-position SequenceExpression (minified tail,
// comma-joined statements, nested sequences). the destructure-emitter gate peels only
// Paren+TS so this shape silently bails. rewrite the ExpressionStatement's
// SequenceExpression body as consecutive `;`-terminated statements in source text so
// the standard destructure flow handles the inner assignment. side-effecting prefix
// expressions stay in source order as preceding statements.
// shares shape detection with babel-plugin's equivalent pre-pass, but can't reuse babel's
// AST-level mutation: oxc AST positions must stay valid for downstream MagicString edits, so
// we rewrite the text and re-parse. walks Program body AND every descendant statement-list
// host (BlockStatement / TSModuleBlock / StaticBlock) so function / loop / try / namespace
// bodies are covered too - a Program-only walk would silently bail inside non-Program lists.
// splits only the OUTERMOST matching statements per pass; the caller loops to a fixpoint to
// reach nested matches (see the call site for why one pass can't take them all)
function applyMinifierSequenceSplitPass(code, ast) {
  const matches = [];
  forEachStatementListBody(ast, statements => {
    for (const stmt of statements) {
      const expressions = getMinifierSequenceDestructureExpressions(stmt);
      if (expressions) matches.push({ start: stmt.start, end: stmt.end, expressions });
    }
  });
  if (!matches.length) return null;
  const mutated = new MagicString(code);
  // a nested match (inner `(eff(), ({x}=obj))` within outer `(fn, ({y}=obj2))`) lives inside
  // its enclosing statement's range. overwriting both on one MagicString would re-split a
  // chunk an earlier overwrite already edited, which MagicString rejects. statement ranges
  // nest cleanly (no partial overlap), so sorting by start ascending then walking once while
  // skipping any match that begins before the last kept match's end yields exactly the
  // outermost, non-overlapping set. skipped inner matches resurface on the next fixpoint pass
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  let lastKeptEnd = -1;
  for (const match of matches) {
    if (match.start < lastKeptEnd) continue;
    const splitText = match.expressions.map((expr, index) => {
      const slice = code.slice(expr.start, expr.end);
      // a bare leading string-literal operand, once split off, lands at Directive Prologue
      // position and silently flips the enclosing block into strict mode. a `0,` sequence
      // prefix keeps it a plain expression statement (matches the babel-plugin split).
      // a parenthesized operand already prints its parens, so it can never become a directive
      if (index === 0 && expr?.type === 'Literal' && typeof expr.value === 'string') return `0, ${ slice };`;
      return `${ parenthesizeExprStmtHazard(slice) };`;
      // single-line join: every split product inherits the ORIGINAL statement's line, so a
      // `core-js-disable-next-line` above the collapsed statement covers ALL of them (the
      // babel split carries origin loc onto its products - this is the text-engine twin)
    }).join(' ');
    // left-boundary ASI guard: the statement was detected separate against its ORIGINAL leading `(`
    // (which ASI-splits a postfix `++` / `--` prev), but the split's FIRST product re-roots the line on a
    // hazard char (`+eff()` / `/re/...`) that the prev no longer separates from - inject the `;` to keep
    // them two statements (and so the re-parse below doesn't choke on the fused form and abandon the split)
    if (statementOverwriteFusesLeft(code, match.start, splitText[0])) mutated.prependLeft(match.start, ';');
    mutated.overwrite(match.start, match.end, splitText);
    lastKeptEnd = match.end;
  }
  return mutated.toString();
}

// disable-directive state for a (code, ast, comments) snapshot: the offset->line mapper
// plus the parsed line set. `disable-file` only counts above any code - a `'use strict'`
// prologue can precede it, so directives before the cutoff are skipped. shared by the
// pipeline's main parse and the proxy-hop pre-pass (which must consult the ORIGINAL text:
// its own re-parse shifts offsets, but preserves line structure, so the two parses' line
// numbers stay interchangeable)
function parseDisableState(code, ast, comments) {
  const offsetToLine = buildOffsetToLine(code);
  const firstNonDirective = ast.body.find(s => !isDirectiveStatement(s));
  const disabledLines = parseDisableDirectives({ comments, offsetToLine, firstStmtStart: firstNonDirective?.start, ast });
  return { offsetToLine, disabledLines };
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
  // `options.method` lets the shared resolver gate the receiver-drop soundness check to usage-pure
  const estreeAdapter = createEstreeAdapter(() => currentInjector, options.method, () => currentMutatedStatics);
  const typeResolvers = createResolveNodeType(nodeType, types, {
    getPolyfillBindingEntry: (scope, name) => currentInjector?.getBindingInfo?.(name)?.entry ?? null,
    getPolyfillBindingHint: (scope, name) => currentInjector?.getBindingInfo?.(name)?.hint ?? null,
    isReassignedBinding: (name, binding) => currentInjector?.isReassignedBinding?.(name, binding) ?? false,
    // a monkey-patched static no longer returns its known type - drop the static-call return narrow
    // to generic so a patched `Array.from(x).at(0)` isn't type-locked to `_atMaybeArray`
    isMutatedStatic: (object, key) => estreeAdapter.isMutatedStatic(object, key),
    // estree-toolkit OVER-HOISTS `namespace N { export var x }` bindings to the enclosing
    // program / function scope - a raw lookup surfaced the namespace twin for a use OUTSIDE
    // the block and narrowed the outer binding to the WRONG flavor. position-aware (the
    // mirror of the detect adapter's over-hoist filter): with a use path, the namespace
    // binding only shadows uses INSIDE its block; without one (path-less resolver routes)
    // the namespace binding is dropped conservatively - generic dispatch, never a wrong
    // narrow. babel scopes namespaces correctly and keeps the factory's raw default
    getScopeBinding(scope, name, path = null) {
      const binding = scope?.getBinding(name);
      if (!binding) return binding;
      const block = namespaceScopedBindingBlock(binding);
      if (block && !(path && pathContainedBy(path, block))) return null;
      // drop estree-toolkit's phantom declaration-violations (over-hoisted namespace twin, for-init
      // self) so the resolver's reassignment gates don't abandon a sound narrow babel performs;
      // path-preserving, so real reassignment paths still reach `findPrecedingBlockAssignment`
      return withoutPhantomDeclarationViolations(binding);
    },
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
      // `isCallee` peels parens / TS wrappers / ChainExpression from `parent.callee` before the
      // identity check, so the resolver's wrapper-walking `filter()` doesn't over-inject when
      // `parent.callee` is a wrapper around the member (`(obj?.fn)()`)
      isCallee,
      isSpreadElement: node => node?.type === 'SpreadElement',
    },
  });

  const { method, absoluteImports, importStyle: importStyleOption } = providerOptions;
  const {
    mode, pkg, packages, getModulesForEntry, getCoreJSEntry, isEntryNeeded,
    resolveUsage, resolvePure: resolvePureUnfiltered, resolvePureGeneric, resolvePureOrGlobalFallback,
  } = resolver;
  // per-transform mutated-statics set, readable by the factory-scoped adapter / resolvePure
  // filter (the transform-local const cannot be closed over from here)
  let currentMutatedStatics = null;
  // a static the user monkey-patches must never bind to the frozen receiver-less import:
  // every pipeline (member emission, destructure props, param synth) resolves through this
  // filter, so the read keeps flowing through the substituted constructor instead
  const resolvePure = (meta, path) => isMutatedStaticMeta(meta, currentMutatedStatics) ? null : resolvePureUnfiltered(meta, path);
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
    // usage-pure rewrites source text in `pre` (e.g. `arr.flat()` -> `_flat(arr).call(arr)`),
    // so its pre output references the polyfill binding. emit that import INLINE in pre rather
    // than deferring it to post: a post pass that bails (a `core-js-disable-file` directive or
    // other skip-eligibility appearing between passes) or runs without the pre snapshot
    // (persistent-cache eviction, fresh worker, `--force`) would otherwise leave the pre rewrite
    // dangling with no import -> ReferenceError. inline imports keep pre's output self-contained
    // and re-detectable: post re-scans them as existing and dedups (see ImportInjector's pure-import
    // difference against `existingPureImports`), so the combined set stays single-emitted.
    // usage-global only injects side-effect imports (no text rewrite), so a dropped post leaves a
    // missing polyfill rather than a dangling reference - it keeps deferring so post emits the
    // canonical merged side-effect block once
    const deferImports = pass === 'pre' && method !== 'usage-pure';
    let inherit = null;
    // did the inherited pre-pass actually rewrite the source (and thus emit a content-bearing
    // map)? a no-op pre (usage-global detection only) emits no map, so post must NOT chain
    let inheritedPreRewrote = false;
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
      inheritedPreRewrote = stored.preRewroteSource;
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
      // sits below `cachedAst` resolution so the reset is gated correctly (fresh parse only)
      typeResolvers.reset();
      // parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const parsed = parseSync(cleanId, code, { sourceType: isCJSFile ? 'script' : 'module' });
      const [fatal] = parsed.errors?.filter(e => e.severity === 'Error') ?? [];
      if (fatal) {
        // emit a tagged breadcrumb so the user knows core-js saw the bad source first.
        // a caller without a `warn` hook (direct tests / bare invocations - the real bundlers
        // supply one via unplugin's context) gets a throw instead, so the breadcrumb propagates
        // rather than silently dropping the file
        if (typeof this?.warn !== 'function') throw new Error(formatParseErrorForThrow({ error: fatal, code }));
        this.warn(formatParseErrorForWarn({ id, error: fatal, code }));
        return null;
      }
      ast = parsed.program;
      comments = parsed.comments;
    }

    // minifier-shape pre-pass: rewrite `(prefix, ..., destructure);` shapes into
    // `prefix; ... ; destructure;` consecutive statements before any visitor walks the tree,
    // re-parsing after each rewrite so the text and AST positions line up.
    // a single pass splits only the outermost matches (it can't touch a nested match without
    // re-editing an already-split chunk), so a destructure-in-sequence buried inside another
    // surfaces as a free-standing statement only after its enclosing statement has been
    // rewritten and re-parsed. loop to a fixpoint: each pass strictly reduces the remaining
    // nesting depth, so the loop is guaranteed to terminate on its own once no match remains.
    // the iteration cap is a pure safety net - it bounds the worst case if a future parser
    // change ever let a rewrite re-introduce a match instead of consuming one, so a malformed
    // input can never spin the build forever. it is set far above any real nesting depth
    const MINIFIER_SPLIT_PASS_CAP = 64;
    let preSplitCode = null;
    for (let splitPass = 0; splitPass < MINIFIER_SPLIT_PASS_CAP; splitPass++) {
      const splitCode = applyMinifierSequenceSplitPass(code, ast);
      if (!splitCode) break; // fixpoint reached: nothing left to split
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const reparsed = parseSync(cleanId, splitCode, { sourceType: isCJSFile ? 'script' : 'module' });
      const [reparseFatal] = reparsed.errors?.filter(e => e.severity === 'Error') ?? [];
      // reparse failure shouldn't happen (the initial parse already validated the source);
      // keep the last good code+ast and let the destructure-emitter gate silently bail
      if (reparseFatal) break;
      if (preSplitCode === null) preSplitCode = code; // capture the original text once so the sourcemap can restore sourcesContent
      code = splitCode;
      ast = reparsed.program;
      comments = reparsed.comments;
      typeResolvers.reset();
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

    const { offsetToLine, disabledLines } = parseDisableState(code, ast, comments);
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
    const mutationInfo = method === 'usage-pure' ? collectMutationPrePass(ast, estreeAdapter) : null;
    const mutatedStatics = mutationInfo?.mutated ?? null;

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
    // typeResolvers' `getPolyfillBindingEntry` AND estreeAdapter's `polyfillHint` close over the
    // plugin instance's `currentInjector` slot; `resolvePure` + the adapter close over the
    // `currentMutatedStatics` slot. save/restore BOTH per-transform slots together via try/finally
    // (closing at runTransformInner's tail) so a re-entrant inner transform leaves the outer's slots
    // intact - the early-return guards above (typeof/isCoreJSFile/disable-file/parse-fail) run BEFORE
    // the save and never touch them. cross-transform AST node identity won't carry through (ASTs differ
    // per transform), so resolver's WeakMap caches don't observe the swap. `import _Promise from
    // '.../constructor'; _Promise.resolve(1)` recognises `_Promise` as a proxy-global for the Promise
    // constructor and rewrites to `_Promise$resolve(1)` (matches babel adapter behavior)
    const previousInjector = currentInjector;
    const previousMutatedStatics = currentMutatedStatics;
    currentInjector = injector;
    currentMutatedStatics = mutatedStatics;
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
          // so the dedup filter must not suppress re-emit. the DEFER pass leaves user global
          // imports COMPLETELY alone (no removal, no registration): its own emission is
          // deferred to post, so removing here would strand the file import-less if the post
          // pass never lands (evicted snapshot / sibling bail / watch-mode re-run), and
          // registering would poison the snapshot dedup against post's atomic remove+re-emit
          onGlobalImport: (mod, node) => {
            if (deferImports) return;
            injector.addGlobalImport(mod);
            removed.add(node);
          },
          onPureImport: (entry, name) => injector.registerUserPureImport(entry, name),
          packages,
          pkg,
        });
        if (removed.size) {
        // a plain import / require splices from the AST too - `await import(...)` would otherwise drag
        // Promise polyfills via the syntax visitor after its statement is gone from output. an indirect-
        // require (`(spy(), require)('core-js/X')`) keeps its callee as a bare statement (`spy(), require;`):
        // the node STAYS in the AST re-pointed at the callee, so the syntax visitor still polyfills any
        // usage inside the kept prefix (`(arr.includes(1), require)(...)` -> `es.array.includes` injected)
          const keptCallees = new Map();
          for (const node of removed) {
            const callee = coreJSImportRemovalKeptCallee(node);
            if (callee) keptCallees.set(node, callee);
          }
          ast.body = ast.body.filter(n => !removed.has(n) || keptCallees.has(n));
          const removeStatement = createTopLevelStatementRemover(ms);
          for (const node of removed) {
            const callee = keptCallees.get(node);
            if (callee) {
              ms.overwrite(node.start, node.end, `${ ms.slice(callee.start, callee.end) };`);
              node.expression = callee;
            } else removeStatement(node);
          }
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

      // shared mutated-key enrichment: see `enrichMutatedStatics` for the model. explicitly
      // mark referenced - no Identifier in the source ever reads the bindings
      if (method === 'usage-pure') {
        enrichMutatedStatics({
          mutatedStatics,
          resolvePure: resolvePureUnfiltered,
          injectPureImport: (entry, hint) => injector.trackReferencedName(injectPureImport(entry, hint)),
        });
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
            // pre rewrote the source iff it changed (usage-pure), which is exactly when it emitted
            // a content-bearing map for post to chain to. a no-op pre returns a null map (line below)
            preRewroteSource: !canReuseParse,
          });
        }
        // post's snapshot delete happens earlier in runTransform (via `snapshots.take(id)`)
        // so it runs even on early-return paths (parse error, disabled directive). the
        // `isCoreJSFile` check runs BEFORE the snapshot is taken, so its early-return
        // doesn't need cleanup - the snapshot was never claimed
        if (!ms.hasChanged()) return null;
        // re-prepend BOM through MagicString so the sourcemap's output columns on line 0
        // account for the extra char (external string concat would leave mappings claiming
        // output[0,0] -> source[0,0] while the real output[0,0] is the BOM). gated on
        // hasChanged so no-op transforms still return null
        if (hasBOM) ms.prepend('\uFEFF');
        // pre+post `pass='post'` chaining through the pre-pass map's content: omit sourcesContent
        // here only when pre ACTUALLY rewrote the source (`ms.original` is then pre-output, and pre
        // emitted a content map to chain to). a no-op pre (usage-global, detection only) emits no
        // map, so chaining would drop content entirely - emit it here instead. standalone
        // `phase: 'post'` (no inherit) operates on the raw source, so content must be emitted too
        const chainedFromPre = pass === 'post' && !!inherit && inheritedPreRewrote;
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
        isInStaticContext,
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
          isInStaticContext,
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
        // no fileId arg: transform-queue throws are unbranded (`transform-queue: <msg>`); the outer
        // catch's `tagError(error, id)` owns the single `[core-js] [<id>] ` brand + file tag
        const transforms = new TransformQueue(code, ms);

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
          enclosingExpressionStatementPath,
          estreeAdapter,
          injectPureImport,
          isBodylessStatementBody,
          isEntryNeeded,
          isInStaticContext,
          NEEDS_GUARD_PARENS,
          resolveGlobalPolyfill,
          resolvePureOrGlobalFallback,
          resolveStaticInheritedMember,
          scopeTracker,
          skippedNodes,
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
          paramDefaultNeverOverridden: typeResolvers.paramDefaultNeverOverridden,
          estreeAdapter,
          getDebugOutput: () => debugOutput,
          injectPureImport,
          injector,
          isBodylessStatementBody,
          isDisabled,
          nodeSrc,
          resolveGlobalPolyfill,
          resolvePure,
          scopeTracker,
          skippedNodes,
          source: code,
          transforms,
        });
        const {
          applyDestructuringTransforms,
          applySynthSwaps,
          canFullyConsumeProxyDeclarator,
          handleDestructuringPure,
          tryFlattenProxyHopHost,
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

        // skip the receiver leaf Identifier unless a re-emitted sideEffect subtree preserves it
        // (then its own substitution must stay queued); shared by the fallback + static dispatches.
        // the outer emit drops the WHOLE receiver text, so a sequence's effect-free PREFIX
        // operands (`(Iterator, Array).from(x)` - `Iterator` is neither the leaf nor carried in
        // sideEffects) vanish too: suppress their subtrees, or their own queued rewrites have no
        // needle left to compose into
        function skipUnpreservedReceiverLeaf(objectNode, sideEffects) {
          const inner = unwrapReceiverLeaf(objectNode);
          if (inner?.type === 'Identifier' && !innerPreservedBySideEffects(inner, sideEffects)) {
            skippedNodes.add(inner);
          }
          const work = [objectNode];
          while (work.length) {
            const cur = work.pop();
            if (!cur || typeof cur !== 'object') continue;
            if (cur.type === 'SequenceExpression') {
              for (const operand of cur.expressions.slice(0, -1)) {
                if (!innerPreservedBySideEffects(operand, sideEffects)) {
                  walkAstNodes({ root: operand, visit: n => skippedNodes.add(n) });
                }
              }
              work.push(cur.expressions.at(-1));
            } else if (cur.type === 'ParenthesizedExpression' || cur.type === 'ChainExpression'
              || TS_EXPR_WRAPPERS.has(cur.type)) {
              work.push(cur.expression);
            }
          }
        }

        const usagePureCallback = (meta, metaPath) => {
          // bundle early-return gates: disable directives + already-handled nodes + JSX
          // identifiers (`<_Map/>` would call the polyfill as a React component) +
          // type-annotation positions. monkey-patched statics never reach here: detection
          // returns no meta for them and the receiver flows through the identifier machinery
          if (isDisabled(metaPath.node) || skippedNodes.has(metaPath.node)
            || metaPath.node?.type === 'JSXIdentifier'
            || isInTypeAnnotation(metaPath)) return;
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
              // this-receiver dispatch cannot route through the substituted constructor
              // object (the patch lives on the namespace, not the prototype chain) - bail
              if (isMutatedStaticMeta(meta, mutatedStatics)) return;
            }
            if (isTaggedTemplateTag(parent, node, meta.placement)) return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator({
              node, parent, metaPath, sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
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
            // a kept SE-bearing inline-call receiver already yields the polyfill binding through
            // its own rewritten return leaf - leave the member untouched, the inner visits do the job
            if (staticFallbackSwapRedundant(node.object, meta.sideEffects)) return;
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
            replaceStaticFallback({
              binding, node, metaPath, sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
            });
            // outer text-emit absorbs the whole receiver: any inner Identifier whose name
            // matches the polyfill's substitution would compose into the emit (`_Map` substring
            // inside the outer's `_Map` -> `__Map`). peel through wrappers + IIFE shells to find
            // the effective receiver leaf and mark it skipped before the Identifier visitor runs;
            // a leaf preserved by a re-emitted sideEffect subtree keeps its own substitution
            skipUnpreservedReceiverLeaf(node.object, meta.sideEffects);
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
          // the inherited-static-resolves-to-instance bail (`super.X` / `this.X` in static ctx where
          // X has no static on the super class) lives in the provider's `resolvePureWith` now (single
          // sourced with usage-global's `resolveUsage`), so `pureResult` is already null for that shape
          // and the `if (!pureResult) return;` above caught it - the fallback never fires (gated on
          // `!inheritedStatic`)
          if (!pureResult) return;
          const { entry: importEntry, kind, hintName } = pureResult;
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
            replaceInstance({
              binding, node, parent, metaPath, sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
            });
          } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
            replaceGlobalOrStatic({
              binding, node, parent, metaPath, inheritedStatic,
              sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
            });
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
            if (node.type === 'MemberExpression') skipUnpreservedReceiverLeaf(node.object, meta.sideEffects);
          }
        };

        // mount tracker for every post pass (parity with `injector.enableReferenceTracking()`
        // gate above): standalone `phase: 'post'` without a pre-pass snapshot also needs
        // `referencedInSource` populated, otherwise `pruneUnusedRefs`'s dead-import filter
        // strips ALL pure imports because no Identifier ever calls `trackReferencedName`.
        //
        // a fully-consumed proxy-global destructure (every outer prop resolvable as proxy-global
        // shorthand or nested static method) discards its init span in the outer rewrite, so the
        // natural visitor must be suppressed on every part of the init that gets dropped - else a
        // proxy-global root inside it injects a now-dead `_globalThis` import AND queues a transform
        // that orphans inside the dropped-init overwrite ("could not locate inner needle" crash).
        // under an SE SequenceExpression the SIDE-EFFECT-FREE prefix operands (`((() => [1].at(0)),
        // Array)`: the uninvoked arrow's `[1].at(0)`) are always dropped; the effect-free receiver
        // tail (`(eff(), globalThis)`: the `globalThis` root) is dropped too EXCEPT in a for-init,
        // which can't lift the prefix standalone and instead re-embeds `(SE, tail)` into a sink
        // declarator - there the tail's proxy-global root MUST stay visible so it is polyfilled (a
        // raw `globalThis` would ReferenceError on engines lacking it). a side-effecting operand is
        // kept (SE-lifted / emitted standalone for effect) and stays visitable. matches babel, which
        // drops the dead subtrees and prunes their unreferenced imports. a bare (non-sequence) init
        // has `tail === init` so `skippedNodes.add(init)` already covers it; conditional / logical
        // fallback inits (`cond ? Array : Set`) are also `tail === init` and rewritten per-branch, so
        // the tail guard leaves them visitable. enter fires before descending into the init, beating
        // the usage callback that would observe its children
        function skipFullConsumeDeadInit(init, isForInit) {
          skippedNodes.add(init);
          const { prefix, tail } = peelNestedSequenceExpressions(init);
          for (const operand of prefix) {
            if (!mayHaveSideEffects(operand)) walkAstNodes({ root: operand, visit: n => skippedNodes.add(n) });
          }
          if (!isForInit && tail !== init && !mayHaveSideEffects(tail)) {
            walkAstNodes({ root: tail, visit: n => skippedNodes.add(n) });
          }
        }

        function isForInitHost(path) {
          const parent = path.parentPath?.node;
          return parent?.type === 'ForStatement' && parent.init === path.node;
        }

        const usageVisitors = mergeVisitors({
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          VariableDeclaration(path) {
            const isForInit = isForInitHost(path);
            for (const d of path.node.declarations) {
              if (d.init && canFullyConsumeProxyDeclarator(d, path.scope, path)) skipFullConsumeDeadInit(d.init, isForInit);
            }
            // unconditional proxy-hop trigger (the retired normalize pre-pass's job): an
            // anchored plan must fire even when no leaf resolves
            tryFlattenProxyHopHost(path);
          },
          AssignmentExpression(path) {
            // assignment-host analog of the VariableDeclaration skip above: `({ Map } = (eff(),
            // globalThis));` fully consumes through `emitPolyfilled` too, dropping the same dead init.
            // gated on STATEMENT position (`peelToExpressionStatement`, which also admits the minifier
            // `(0, ({...} = R))` SE-tail wrapper): only there does the full-consume emit fire and drop
            // the receiver. an expression-context destructure-assignment (`(({ Map } = R), x)`) is left
            // untransformed by the emit, so skipping its receiver would strip a needed proxy-global
            // polyfill (raw `globalThis` -> ReferenceError); never for-init (not an ExpressionStatement)
            const { node } = path;
            if (node.operator === '=' && node.left?.type === 'ObjectPattern' && peelToExpressionStatement(path)
              && canFullyConsumeProxyDeclarator({ id: node.left, init: node.right }, path.scope, path)) {
              skipFullConsumeDeadInit(node.right, false);
            }
            tryFlattenProxyHopHost(path);
          },
        }, createUsageVisitors({
          adapter: estreeAdapter,
          onUsage: usagePureCallback,
          onWarning: msg => debugOutput?.warn(msg),
          method,
          suppressProxyGlobals: true,
          walkAnnotations: false,
          isEntryAvailable: isEntryNeeded,
          resolveMeta: resolvePure,
        }));
        traverse(ast, trackReferences ? mergeVisitors(usageVisitors, {
          Identifier(path) { injector.trackReferencedName(path.node.name); },
        }) : usageVisitors);
        applySynthSwaps();
        applyDestructuringTransforms();
        scopeTracker.applyTransforms(transforms);
        return finalize();
      }
      if (method === 'usage-pure') return runUsagePure();

      return null;
    } finally {
      currentInjector = previousInjector;
      currentMutatedStatics = previousMutatedStatics;
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
