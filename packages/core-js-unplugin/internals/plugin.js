import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import { restSentinelNamesReducer } from '@core-js/polyfill-provider/detect-usage/own-output';
import {
  BRACE_STATEMENT_HOST_TYPES,
  SINGLE_STATEMENT_SLOTS,
  SKIPPABLE_WRAPPER_TYPES,
  collectFileCensus,
  createTypeAnnotationChecker,
  detectCommonJS,
  extractIndirectRequireSEPrefix,
  forEachStatementPosition,
  getMinifierSequenceDestructureExpressions,
  hasTopLevelESM,
  isForXWriteTarget,
  isMemberWriteHost,
  isMutatedStaticMeta,
  isMutatedStaticPair,
  isStatementPosition,
  isThisReceiver,
  memberKeyNamesReducer,
  methodReadsUsageCensus,
  mutatedGlobalSlotNames,
  namespaceScopedBindingBlock,
  peelParenAndTSParentPath,
  prologueEndIndex,
  sequenceHeadDirectiveHazard,
  usableAliasInfo,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  enrichMutatedStatics,
  escapedCtorReferencesReducer,
  mutationShapesReducer,
} from '@core-js/polyfill-provider/detect-usage/mutations';
import {
  createClassHelpers,
  ctorAliasShapesReducer,
  proxyWriteOriginsReducer,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { tagError } from '@core-js/polyfill-provider/helpers/error-tag';
import { isCoreJSFile } from '@core-js/polyfill-provider/helpers/path-normalize';
import {
  DISABLE_NEXT_LINE_DIRECTIVE,
  buildOffsetToLine,
  buildOffsetToLineColumn,
  disableDirectiveAnchors,
  isLineBoundDisableDirective,
  isNextLineDisableDirective,
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
import { planEntries } from './detect-entry.js';
import applyEntryProgram, { injectImportStatements } from './entry.js';
import { printProgram } from './print.js';
import ImportInjector, { flushIntoProgram } from './import-injector.js';
import createAstDestructureEmitter from './destructure.js';
import createAstUsagePureCallback from './usage-pure.js';
import { markSubtreeSkipped } from './nav-spine.js';
import {
  closestVisibleNativeBinding,
  withoutPhantomDeclarationViolations,
  collectAliasPrePass,
  collectMutationPrePass,
  createEstreeAdapter,
  createUsageVisitors,
  createSyntaxVisitors,
} from './detect-usage.js';
import {
  walkAstNodes,
  bindingNamesReducer,
  hasCoreJSImport,
  isChunkLoaderBundler,
  KNOWN_BUNDLERS,
  liftSfcLangSuffix,
  parenthesizeExprStmtHazard,
  sourceDialectOf,
  injectionFusesLeft,
  stripLeadingBOMs,
  isCallee,
  optionalCallInstantiationCallee,
} from './plugin-helpers.js';
import SnapshotCache from './snapshot-cache.js';

// estree-toolkit consumes a binding pattern in exactly ONE place - `findVisiblePathsInPattern`,
// which its scope crawler reaches only from the slots it models: the `params` of the three node
// types that own a scope, plus a catch param, a declarator id, a for-x left and an assignment
// left. A pattern anywhere else reaches the generic identifier crawler instead, where an
// `Identifier` under `RestElement`, `ArrayPattern` or `AssignmentPattern` throws and aborts the
// whole file's transform. So the property to compensate is "this node's params are NOT walked as
// a pattern", never a list of type names: every type-level function shape TS has qualifies, from
// `TSFunctionType` in a plain `type F = (...a: any[]) => void` to an overload head
const PARAM_PATTERN_SCOPE_OWNERS = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
]);

// a params list is emptied by CONTAINER, keeping the param node itself: what the type layer reads
// off such a param is its own `type` and `typeAnnotation` - `Parameters<typeof fn>[N]` on a rest
// param yields the element type only while the param is still spelled `RestElement` - while
// everything the crawler could reach lives strictly inside those containers, so blanking them is
// both closed over the nesting and lossless - the walker reads a fixed key list for every node
// type it defines and only falls back to every own key for the ones it does not, so a TS
// annotation hanging off a defined node is never descended into at all. That is why an annotation
// under a declarator id or a real function param cannot abort the crawl however deep its own
// signatures nest, and why the blanked container's own annotation stays out of reach as well.
// What must NOT be touched is a param that is not a
// pattern at all: a type-argument list (`ReturnType<typeof f>`) and a type-parameter list
// (`<T = (...a: any[]) => void>`) also spell their members `params` in this dialect
function blankPatternInterior(node) {
  let param = node;
  // an initializer is a syntax error in every type-level param list, and the accessibility
  // wrapper carries nothing a type reader wants, so both peel to what they wrap
  while (param?.type === 'AssignmentPattern' || param?.type === 'TSParameterProperty') {
    param = param.type === 'AssignmentPattern' ? param.left : param.parameter;
  }
  switch (param?.type) {
    case 'RestElement': return { ...param, argument: null };
    case 'ArrayPattern': return { ...param, elements: [] };
    case 'ObjectPattern': return { ...param, properties: [] };
    default: return param;
  }
}

// the node TYPE stays as parsed: retyping an ambient head to a body-bearing `FunctionDeclaration`
// makes an overload head indistinguishable from its implementation, which widens `f()` over the
// heads babel resolves through the impl
// exported for the cross-parser test harness: any consumer that builds estree-toolkit SCOPES over a
// TS AST needs this same pass first, or a bodyless signature with a pattern parameter aborts the
// crawl before its own visitors run
// `restorations`: the neutralization is a DETECTION convenience, but the print sees the
// same tree, and a blanked rest argument or an
// unwrapped parameter-property would print corrupted TS. every mutation pushes its undo;
// `finalizeAst` replays them in reverse right before the print
export function neutralizeUnwalkedParamPatterns(node, restorations = null) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.params) && !PARAM_PATTERN_SCOPE_OWNERS.has(node.type)) {
    for (let i = 0; i < node.params.length; i++) {
      const original = node.params[i];
      const blanked = blankPatternInterior(original);
      if (blanked === original) continue;
      restorations?.push(() => {
        node.params[i] = original;
      });
      node.params[i] = blanked;
    }
    // fall through: `returnType` and `typeParameters` of the same node carry their own
    // type-level signatures, and a defaulted type parameter is reached by the crawler too
  }
  // a constructor parameter-property with a default (`constructor(public m = 1)`) parses as
  // `TSParameterProperty { parameter: AssignmentPattern }`; `findVisiblePathsInPattern` has no
  // `TSParameterProperty` case, so the pattern inside it is left to the generic crawler and throws
  // even though the constructor itself owns a scope. a plain AssignmentPattern param (no
  // accessibility wrapper) walks fine, so unwrap to the inner pattern in place - the default
  // expression survives (so usage inside it like `= new WeakMap()` is still detected), and
  // accessibility / readonly modifiers are irrelevant to polyfill detection.
  // The wrapper's own decorators (TS legacy `@inject() public m = 1`) move with it: they were
  // reachable only because the wrapper is a node type the walker does not define, so it walked
  // every slot; the shape they land on IS defined, which is exactly the case the decorator
  // compensation covers by hand
  if (node.type === 'TSParameterProperty' && node.parameter?.type === 'AssignmentPattern') {
    const { decorators } = node;
    const inner = node.parameter;
    const saved = { ...node };
    restorations?.push(() => {
      // the walk may have REWRITTEN inside the unwrapped parameter (a polyfillable default):
      // the wrapper restores around what it produced, never around the pre-walk snapshot -
      // that would silently drop the emission
      const mutated = { ...node };
      if (decorators?.length) delete mutated.decorators;
      for (const key of Object.keys(node)) delete node[key];
      Object.assign(node, saved);
      node.parameter = mutated;
    });
    for (const key of Object.keys(node)) delete node[key];
    Object.assign(node, inner);
    if (decorators?.length) node.decorators = decorators;
    neutralizeUnwalkedParamPatterns(node, restorations);
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) neutralizeUnwalkedParamPatterns(child, restorations);
    return;
  }
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) neutralizeUnwalkedParamPatterns(node[key], restorations);
}

// 1-based `line:col` from oxc's first label via shared offset->line+column helper.
// null when label.start is missing or out of range so the caller can skip the location chunk
export function formatLabelLocation(label, code) {
  const pos = buildOffsetToLineColumn(code)(label?.start);
  return pos && `${ pos.line }:${ pos.column }`;
}

// walk past parens, chain expressions, and TS wrappers - they all forward to
// whatever wraps them, so the semantic parent is past them
function semanticParentNode(metaPath) {
  return peelParenAndTSParentPath(metaPath, SKIPPABLE_WRAPPER_TYPES)?.node;
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
// AST-level mutation: every census and claim downstream reads oxc source positions, so this
// pass rewrites the TEXT and re-parses instead of mutating a tree the positions would desert.
// walks Program body AND every descendant statement-list
// host (BlockStatement / TSModuleBlock / StaticBlock) so function / loop / try / namespace
// bodies are covered too - a Program-only walk would silently bail inside non-Program lists.
// splits only the OUTERMOST matching statements per pass; the caller loops to a fixpoint to
// reach nested matches (see the call site for why one pass can't take them all)
function applyMinifierSequenceSplitPass(code, ast) {
  const matches = [];
  // an un-braced control-flow body holds its statement in a single slot, so its split products have
  // nowhere to go until the slot is braced. both position kinds come from ONE walk, and the brace is
  // emitted in this same pass - a block around a sequence's operands declares nothing, so the added
  // scope is unobservable
  function collect(stmt, brace, prevChar) {
    const expressions = getMinifierSequenceDestructureExpressions(stmt);
    if (expressions) matches.push({ start: stmt.start, end: stmt.end, expressions, brace, prevChar });
  }
  forEachStatementPosition(ast, {
    onList(statements) {
      // the prev SIGNIFICANT char at the seam is the LAST char of the previous list member
      // (trivia between the two stays in place and separates nothing at parse level); a
      // list-FIRST statement sits after a block opener / file start - nothing to fuse into
      for (let i = 0; i < statements.length; i++) collect(statements[i], false, i > 0 ? code[statements[i - 1].end - 1] : null);
    },
    onUnbracedSlot(hostNode, key) {
      collect(hostNode[key], true, null);
    },
  });
  if (!matches.length) return null;
  // a nested match (inner `(eff(), ({x}=obj))` within outer `(fn, ({y}=obj2))`) lives inside
  // its enclosing statement's range. statement ranges nest cleanly (no partial overlap), so
  // sorting by start ascending then walking once while skipping any match that begins before
  // the last kept match's end yields exactly the outermost, non-overlapping set. skipped
  // inner matches resurface on the next fixpoint pass
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const chunks = [];
  let cursor = 0;
  let lastKeptEnd = -1;
  for (const match of matches) {
    if (match.start < lastKeptEnd) continue;
    const splitText = match.expressions.map((expr, index) => {
      const slice = code.slice(expr.start, expr.end);
      // a bare leading string-literal operand, once split off, lands at Directive Prologue
      // position and silently flips the enclosing block into strict mode; a TS cast vanishes at
      // type-strip so it doesn't protect the string, while explicit parens survive this text
      // emit and do. a `0,` sequence prefix keeps the hazardous form a plain expression
      // statement (matches the babel-plugin split)
      if (index === 0 && sequenceHeadDirectiveHazard(expr)) return `0, ${ slice };`;
      return `${ parenthesizeExprStmtHazard(slice) };`;
      // single-line join: every split product inherits the ORIGINAL statement's line, so a
      // `core-js-disable-next-line` above the collapsed statement covers ALL of them
      // (the babel split carries origin loc onto its products the same way)
    }).join(' ');
    // left-boundary ASI guard: the statement was detected separate against its ORIGINAL leading `(`
    // (which ASI-splits a postfix `++` / `--` prev), but the split's FIRST product re-roots the line on a
    // hazard char (`+eff()` / `/re/...`) that the prev no longer separates from - inject the `;` to keep
    // them two statements (and so the re-parse below doesn't choke on the fused form and abandon the split)
    chunks.push(code.slice(cursor, match.start));
    if (!match.brace && match.prevChar !== null && injectionFusesLeft(splitText[0], match.prevChar)) chunks.push(';');
    chunks.push(match.brace ? `{ ${ splitText } }` : splitText);
    cursor = match.end;
    lastKeptEnd = match.end;
  }
  chunks.push(code.slice(cursor));
  return chunks.join('');
}

// the opt-outs this pass honoured, re-anchored so they reach the NEXT pass - ours over our own
// output, or `post` over what a sibling lowered between the passes. the printer emits every
// anchored text verbatim on its own line ahead of its node, bypassing the loc heuristics (the
// deterministic channel; see `printProgram`). two sources fill the map:
// - the canon `disableDirectiveAnchors`: every outermost covered node the reprint would leave
//   without its directive. every one of them goes through the channel: the loc channel is a
//   heuristic cursor, and a rebuilt statement or an extraction drags the author's own directive
//   away from its node - so the directive standing directly above a target (its last line the
//   line above the node's first) moves into the channel verbatim, and a target without one
//   takes the canonical spelling
// - the hoist no line scan can express: a disable directive attached INSIDE a destructuring
//   pattern dies in a sibling pass's lowering (babel drops property-attached comments and reflows
//   the survivors), and post then re-claims the very read the user opted out. the comment leaves
//   the loc-attached channel and lands ahead of the STATEMENT (both source spellings - a leading
//   `-next-line` and a trailing `-line` - as the leading form, whose covered line is the
//   statement's first). meaning-preserving ONLY for a SOLE-prop chain - one property at every
//   level down to the covered one (`{ Object: { groupBy } }` with the directive on either line):
//   everything the statement lowers to derives from that disabled prop, so statement scope IS the
//   directive's scope. a level with siblings keeps the author's placement (a hoist would widen or
//   lose the opt-out). POSITIONED hosts too - statements no emission rebuilt - because their
//   in-pattern comment dies in the same lowering; a hoisted statement is settled for the canon
//   walk, its pattern owing no second anchor
function anchorDisableDirectives({ ast, comments, code, offsetToLine, disabledLines }) {
  if (!disabledLines || disabledLines === true) return null;
  const anchored = new Map();
  const removed = new Set();
  const anchorText = `// ${ DISABLE_NEXT_LINE_DIRECTIVE }`;
  // the covered line of a sole-prop chain, walking single-property patterns down from the
  // declarator's id: the first level whose sole property opens on a covered line; null when a
  // level has siblings or none is covered
  function soleChainCoveredLine(pattern) {
    for (let level = pattern; level?.type === 'ObjectPattern' && level.properties.length === 1;) {
      const [prop] = level.properties;
      if (typeof prop.start !== 'number') return null;
      const line = offsetToLine(prop.start);
      if (disabledLines.has(line)) return line;
      level = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    }
    return null;
  }
  // the statement the hoist lands on: the declaration itself in a statement position, the export
  // wrapping it, and nothing for a declaration a loop head hosts - esrap prints such a head inline,
  // so the channel would drop the directive and the print would carry none; there the canon walk
  // below anchors the property in place, where the pattern's own print reaches it
  function hoistTarget(node, parent) {
    if (parent?.type === 'ExportNamedDeclaration' && parent.declaration === node) return parent;
    return isStatementPosition(node, parent) ? node : null;
  }
  if (comments?.length) walkAstNodes({ root: ast, visit(node, parent) {
    if (node.type === 'VariableDeclaration' && node.declarations.length === 1) {
      const target = hoistTarget(node, parent);
      const line = target ? soleChainCoveredLine(node.declarations[0].id) : null;
      if (line !== null) {
        for (const comment of comments) {
          if (typeof comment.start !== 'number' || !isLineBoundDisableDirective(comment.value)) continue;
          const commentLine = offsetToLine(comment.end - 1);
          const covers = isNextLineDisableDirective(comment.value) ? commentLine + 1 === line : commentLine === line;
          if (!covers) continue;
          if (!anchored.has(target)) anchored.set(target, []);
          anchored.get(target).push(anchorText);
          removed.add(comment);
        }
      }
    }
  } });
  const leadingDirectives = (comments ?? []).filter(comment => typeof comment.start === 'number'
    && typeof comment.end === 'number' && isNextLineDisableDirective(comment.value));
  function ownDirectiveText(node) {
    if (typeof node.start !== 'number') return anchorText;
    const line = offsetToLine(node.start);
    const own = leadingDirectives.find(comment => comment.end <= node.start
      && code.slice(comment.end, node.start).trim() === '' && offsetToLine(comment.end - 1) + 1 === line);
    if (!own) return anchorText;
    removed.add(own);
    return code.slice(own.start, own.end);
  }
  for (const node of disableDirectiveAnchors({ ast, disabledLines, offsetToLine, isLed: () => false, settled: anchored })) {
    anchored.set(node, [ownDirectiveText(node)]);
  }
  return anchored.size ? { anchored, removed } : null;
}

// disable-directive state for a (code, ast, comments) snapshot: the offset->line mapper
// plus the parsed line set. `disable-file` only counts above any code - a `'use strict'`
// prologue can precede it, so directives before the cutoff are skipped
function parseDisableState(code, ast, comments) {
  const offsetToLine = buildOffsetToLine(code);
  const firstNonDirective = ast.body[prologueEndIndex(ast.body)];
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
  // observe the WRONG injector after their await point if introduced later - oxc is sync
  // and all current visitors are sync. enforce by inspection
  let currentInjector = null;
  // `options.method` lets the shared resolver gate the receiver-drop soundness check to usage-pure
  const estreeAdapter = createEstreeAdapter({
    getInjector: () => currentInjector,
    method: options.method,
    getMutatedStatics: () => currentMutatedStatics,
    getWrittenContainerSlots: () => currentWrittenContainerSlots,
    isTypingMutatedSlot,
    // lazy: `packages` is destructured from the resolver below; transforms run after
    getPackages: () => packages,
  });
  const typeResolvers = createResolveNodeType(nodeType, types, {
    // guarded alias hints must not feed the type channel - see the babel twin
    // `useStart` anchors the injector's name-keyed view positionally - see the babel twin
    getPolyfillBindingEntry(scope, name, useStart = null) {
      return usableAliasInfo(currentInjector?.getBindingInfo?.(name, useStart))?.entry ?? null;
    },
    getPolyfillBindingHint(scope, name, useStart = null) {
      return usableAliasInfo(currentInjector?.getBindingInfo?.(name, useStart))?.hint ?? null;
    },
    isReassignedBinding: (name, binding) => currentInjector?.isReassignedBinding?.(name, binding) ?? false,
    // a monkey-patched static no longer returns its known type - drop the static-call return narrow
    // to generic so a patched `Array.from(x).at(0)` isn't type-locked to `_atMaybeArray`
    isMutatedStatic: (object, key) => estreeAdapter.isMutatedStaticSlot(object, key),
    // estree-toolkit OVER-HOISTS `namespace N { export var x }` bindings to the enclosing
    // program / function scope - a raw lookup surfaced the namespace twin for a use OUTSIDE
    // the block and narrowed the outer binding to the WRONG flavor. position-aware (the
    // mirror of the detect adapter's over-hoist filter): with a use path, the namespace
    // binding only shadows uses INSIDE its block; without one (path-less resolver routes)
    // the namespace binding is dropped conservatively - generic dispatch, never a wrong
    // narrow. babel scopes namespaces correctly and keeps the factory's raw default
    getScopeBinding(scope, name, path = null) {
      // shared visible-binding canon (the walk the detect adapter runs): a case-block lexical or
      // over-hoisted namespace binding that doesn't cover the use continues the lookup ABOVE it,
      // so an outer same-name binding the use actually reads still narrows (babel scopes these
      // regions natively). `path` keeps frame-scope lookups position-aware among same-name shadows
      const binding = closestVisibleNativeBinding(scope, name, path);
      if (!binding) return binding;
      // a namespace-scoped binding consulted WITHOUT a position cannot prove the use sits
      // inside its block - drop conservatively (generic dispatch, never a wrong narrow)
      if (!path && namespaceScopedBindingBlock(binding)) return null;
      // drop estree-toolkit's phantom declaration-violations (over-hoisted namespace twin,
      // for-init self) so the resolver's reassignment gates don't abandon a sound narrow
      // babel performs; path-preserving, so real reassignment paths still reach
      // `findPrecedingBlockAssignment`
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
    // the per-file mutation census the ENTRY choice consults - see the babel twin
    isMutatedStatic: (object, key) => estreeAdapter.isMutatedStatic(object, key),
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
    mode,
    pkg,
    packages,
    getModulesForEntry,
    getCoreJSEntry,
    isEntryNeeded,
    resolveUsage,
    resolvePure: resolvePureUnfiltered,
    resolvePureOrGlobalFallback,
  } = resolver;
  // per-transform mutated-statics set, readable by the factory-scoped adapter / resolvePure
  // filter (the transform-local const cannot be closed over from here)
  let currentMutatedStatics = null;
  // typing asks a YES/NO about ONE namespace, and the cheap census the shared walk already produced
  // answers it: its target roots are a SUPERSET of what a scoped walk could attribute, so a namespace
  // none of them names is provably untouched, and an over-report only degrades a narrow (over-inject,
  // the safe direction in usage-global). the scoped pre-pass stays where its completeness is required
  let currentMutationRoots = null;
  let currentWrittenContainerSlots = null;
  function isTypingMutatedSlot(object, key) {
    if (options.method === 'usage-pure') return isMutatedStaticPair(object, key, currentMutatedStatics);
    if (!currentMutationRoots) return false;
    return currentMutationRoots.open || currentMutationRoots.names.has(object);
  }
  // a static the user monkey-patches must never bind to the frozen receiver-less import:
  // every pipeline (member emission, destructure props, param synth) resolves through this
  // filter, so the read keeps flowing through the substituted constructor instead
  function resolvePure(meta, path) {
    return isMutatedStaticMeta(meta, currentMutatedStatics) ? null : resolvePureUnfiltered(meta, path);
  }
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
    let inheritedMutatedStatics = null;
    let cachedAst = null;
    let cachedComments = null;

    // strip bundler query/hash suffix before passing the id to oxc-parser - oxc infers
    // the parser language from the extension and would otherwise see e.g. `tsx?import`
    // and reject the TypeScript syntax silently. SFC virtual ids embed the language hint
    // INSIDE the query (`?vue&type=script&lang=ts`); `liftSfcLangSuffix` recovers it onto
    // the post-strip id so the right parser fires
    const cleanId = liftSfcLangSuffix(id);
    // CJS files (.cjs, .cts) parse as scripts and, like files that look like CommonJS, get the
    // 'require' import style by default
    const sourceDialect = sourceDialectOf(cleanId);
    const isCJSFile = sourceDialect.script;
    // strip leading BOM(s) before parsing - oxc rejects BOM-prefixed shebangs, and
    // offsetting positions by 1 would corrupt every transform. the output does NOT carry a
    // BOM (babel alignment - bundlers strip it anyway); `hasBOM` survives only so
    // `sourcesContent` can keep the user's original bytes. Reassign `code` so the minifier
    // split AND the post-pass cache comparison use the BOM-stripped source (stored
    // `postInput` is always BOM-stripped). `stripLeadingBOMs` drops the whole leading run
    // so a sibling plugin's per-pass prepend doesn't leave residual BOM bytes mid-prefix
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
      inheritedMutatedStatics = stored.mutatedStatics;
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

    // a binding pattern in a params list estree-toolkit never walks as a pattern - every
    // type-level signature TS has - aborts the crawl, so neutralize them before it runs.
    // deliberately UNCONDITIONAL: the pass is a plain walk over an AST the parser has just built
    // and the crawler is about to walk again, so gating it on a TS extension buys nothing measurable
    // and costs a code path resting on a subtle assumption - oxc enables TS on `.ts`/`.mts`/`.cts`/
    // `.tsx`, lowercase only, so a `.TS` file would silently lose the pass
    const patternRestorations = [];
    neutralizeUnwalkedParamPatterns(ast, patternRestorations);

    // source wins over extension: a `.cjs`/`.cts` with top-level ESM (oxc parses tolerantly)
    // must emit `import`, or bundlers reject the mixed output
    const importStyle = importStyleOption
      ?? (!hasTopLevelESM(ast) && (isCJSFile || detectCommonJS(ast)) ? 'require' : 'import');
    // the SAME answer decides strictness, because it is the same question: a CommonJS file is a
    // script, and a script is the only place Annex-B block-function hoisting exists. the parse is
    // told `script` only by extension, so BOTH directions have to be written back or the answer
    // splits - a `.cjs` carrying top-level ESM parses as script yet is a module by its own syntax,
    // and every other id parses as module yet may be a script by body or option. reading the
    // resolved `importStyle` is what keeps the two consumers single-sourced: an explicit
    // `importStyle: 'require'` DECLARES a CommonJS input, and that declaration must reach the
    // strictness model too. an `.mjs`/`.mts` id is a module by EXTENSION whatever the body or the
    // option says, so it is the one signal neither the heuristic nor the option can override
    ast.sourceType = importStyle === 'require' && !/\.m[jt]s$/.test(cleanId) ? 'script' : 'module';

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
    // the shared read canons consult the live `currentMutatedStatics` slot through the adapter;
    // a re-entrant inner transform must not see the outer file's set while collecting - null the
    // slot for exactly the collection window
    // ONE raw walk answers every per-file census question (binding / member-key name
    // reservation + the mutation / ctor-alias shape gates) - the scans it replaces each
    // re-walked the whole file. computed here, after the minifier split re-parse, so every
    // consumer reads the same tree it scanned before
    // gated by the shared predicate. here NOTHING survives the gate - unlike babel, this census
    // carries no minifier-shape reducer (the split ran before it) - and an empty reducer list
    // would still walk, so the whole census is skipped rather than narrowed
    const readsCensus = methodReadsUsageCensus(method);
    const fileCensus = readsCensus ? collectFileCensus(ast, [
      bindingNamesReducer(),
      escapedCtorReferencesReducer(),
      restSentinelNamesReducer(),
      memberKeyNamesReducer(),
      mutationShapesReducer(packages),
      ctorAliasShapesReducer(),
      proxyWriteOriginsReducer(),
    ]) : {};
    let mutationInfo = null;
    // INJECTION policy only, so usage-pure only: a global-flavor bail here would drop an import
    // instead of adding one. the typing side asks the same data separately and lazily (below)
    if (method === 'usage-pure') {
      const outerMutatedStatics = currentMutatedStatics;
      currentMutatedStatics = null;
      try {
        mutationInfo = collectMutationPrePass(ast, estreeAdapter, fileCensus);
      } finally {
        currentMutatedStatics = outerMutatedStatics;
      }
    }
    let mutatedStatics = mutationInfo?.mutated ?? null;
    // pre+post: union PRE's mutation set into post's own recompute. the keys are semantic
    // slot names, so they survive sibling rewrites of the receiver text that the prepass
    // cannot re-derive - babel's CJS lowering between the phases turns the pre-substituted
    // `_globalThis.Map = shim` into `_g.default.Map = shim`, and losing the taint would
    // substitute ponyfills over the user's runtime patch. union, not replace: a sibling
    // may also INTRODUCE mutation shapes after pre
    if (inheritedMutatedStatics?.size) {
      mutatedStatics = new Set([...inheritedMutatedStatics, ...mutatedStatics ?? []]);
    }

    // late-bound: debugOutput is constructed below (after createPolyfillResolver) but the
    // injector closes over it for fallback warnings. hoist above the try block so the lazy
    // getter sees the same binding the later assignment populates
    let debugOutput = null;
    const injector = new ImportInjector({
      pkg,
      packages,
      mode,
      emitsGlobalModules: method !== 'usage-pure',
      absoluteImports,
      importStyle,
      inherit,
      getDebugOutput: () => debugOutput,
    });
    // typeResolvers' `getPolyfillBindingEntry` AND estreeAdapter's `polyfillHint` close over the
    // plugin instance's `currentInjector` slot; `resolvePure` + the adapter close over the
    // `currentMutatedStatics` slot. save/restore ALL per-transform slots together via try/finally
    // (closing at runTransformInner's tail) so a re-entrant inner transform leaves the outer's slots
    // intact - the early-return guards above (typeof/isCoreJSFile/disable-file/parse-fail) run BEFORE
    // the save and never touch them. every slot the adapter exposes belongs to the set, including
    // the written-container map: a slot left behind by an inner transform outlives the file it
    // describes. cross-transform AST node identity won't carry through (ASTs differ per transform),
    // so resolver's WeakMap caches don't observe the swap. `import _Promise from
    // '.../constructor'; _Promise.resolve(1)` recognises `_Promise` as a proxy-global for the
    // Promise constructor and rewrites to `_Promise$resolve(1)` (matches babel adapter behavior)
    const previousInjector = currentInjector;
    const previousMutatedStatics = currentMutatedStatics;
    const previousMutationRoots = currentMutationRoots;
    const previousWrittenContainerSlots = currentWrittenContainerSlots;
    currentInjector = injector;
    currentMutatedStatics = mutatedStatics;
    currentMutationRoots = fileCensus.mutationRoots ?? null;
    currentWrittenContainerSlots = fileCensus.writtenContainerSlots ?? null;
    try {
    // single AST scan - `names` seeds UID-collision guards at every nesting level;
    // `orphanRefs` feeds orphan adoption when post runs without a prior pre snapshot
    // (sibling-plugin invalidation between passes); filter out user-owned `let _ref` via `names`
      const { names: bindingNames, declaredNames, orphanRefs, restSentinelNames } = fileCensus;
      if (readsCensus) injector.seedReservedNames(bindingNames);
      // user-owned global-object slot names the raw identifier scan above misses: computed
      // STRING-key member spellings (`globalThis['_ref']`) and string-key mutator writes
      // (`Object.defineProperty(self, '_ref', ...)`) - a script-scope `var _ref` temp would
      // alias and clobber the slot
      if (readsCensus) injector.seedReservedNames(fileCensus.memberKeyNames);
      injector.seedReservedNames(mutatedGlobalSlotNames(mutatedStatics));
      // `readsCensus` is the LOCAL statement of this block's dependency: it reads census-only
      // collections, and the method that skips the census hands back a shape without them. today
      // that method also forces `pass: 'single'`, so the phase test alone would keep this
      // unreachable - but resting on a distant, unrelated guard turns a future phase change into a
      // TypeError here instead of the degrade the empty shape is meant to give
      if (readsCensus && pass === 'post' && !inherit && hasCoreJSImport(ast, packages)) {
        const adoptable = new Set();
        for (const ref of orphanRefs) if (!declaredNames.has(ref)) adoptable.add(ref);
        injector.adoptOrphanRefs(adoptable);
      }
      // a rest-destructure sentinel is DECLARED by the rewritten pattern itself
      // (`{ polyKey: _unusedN, ...rest }`), so it comes from the census' sentinel-position names
      // (bound there, read nowhere) and the injector validates the generator shape before
      // re-arming its idempotency skip. that question - "did WE emit this sentinel" - has
      // nothing to do with the phase: gated on `post`, a re-transform of our own output (the
      // ordinary pass is `single`) re-extracted the previous sentinel as a live binding and
      // minted a fresh one, growing the file on every pass. and it is a question of POSITION,
      // not of name shape: a user's `var _unused = 1`, or a `{ at: _unused2, ...rest }` whose
      // `_unused2` is read, adopted on the shape alone, silenced a rest-destructure rewrite
      if (readsCensus && hasCoreJSImport(ast, packages)) injector.adoptUnusedNames(restSentinelNames);
      // the change tracker: body surgery and node normalization leave no text trace,
      // so the abstain decision reads these
      let astSweptImports = false;
      let astNormalized = false;
      if (method !== 'entry-global') {
        const removed = new Set();
        scanExistingCoreJSImports(ast, {
          adapter: estreeAdapter,
          isDisabled,
          mode,
          // the user's global import is REMOVED here and re-emitted through `addGlobalImport`,
          // so nothing may suppress it as already-present. the DEFER pass leaves user global
          // imports COMPLETELY alone (no removal, no registration): its own emission is
          // deferred to post, so removing here would strand the file import-less if the post
          // pass never lands (evicted snapshot / sibling bail / watch-mode re-run)
          onGlobalImport: (mod, node, modPkg) => {
            if (deferImports) return;
            injector.addGlobalImport(mod, modPkg);
            removed.add(node);
          },
          // a user binding the file WRITES through is poisoned as a dedup target - the
          // census' assignedNames is the reassignment fact this leg has (babel reads its
          // scope's constantViolations for the same gate)
          onPureImport: (entry, name) => injector.registerUserPureImport(entry, name, {
            reassigned: fileCensus.assignedNames?.has(name) ?? false,
          }),
          packages,
          pkg,
        });
        if (removed.size) {
          // a plain import / require splices from the AST too - `await import(...)` would otherwise drag
          // Promise polyfills via the syntax visitor after its statement is gone from output. an indirect-
          // require (`0, (spy(), require)('core-js/X')`) keeps its side-effect prefix (outer sequence AND
          // callee) as bare statements via the same rewriter the entry path uses; the node STAYS in the
          // AST re-pointed at that prefix, so the syntax visitor still polyfills any usage inside the kept
          // prefix (`(arr.includes(1), require)(...)` -> `es.array.includes` injected)
          const kept = new Set();
          for (const node of removed) {
            const sePrefix = extractIndirectRequireSEPrefix(node);
            if (!sePrefix.length) continue;
            kept.add(node);
            node.expression = sePrefix.length === 1 ? sePrefix[0] : { type: 'SequenceExpression', expressions: sePrefix };
          }
          astSweptImports = true;
          ast.body = ast.body.filter(n => !removed.has(n) || kept.has(n));
        }
      }
      debugOutput = createDebugOutput?.() ?? null;

      const { injectModulesForEntry, injectModulesForModeEntry, outputDebug } = createModuleInjectors({
        mode,
        getModulesForEntry,
        getDebugOutput() { return debugOutput; },
        injectGlobal: moduleName => injector.addGlobalImport(moduleName),
      });

      // resolve a bare global name (`Array`, `Promise`, `globalThis`) to its pure polyfill
      // binding info; null when not polyfillable as a global. shared between the usage-pure
      // callback and the destructure emitter
      function resolveGlobalPolyfill(name) {
        const pure = resolvePure({ kind: 'global', name });
        return pure && pure.kind !== 'instance' ? pure : null;
      }

      function injectPureImport(entry, hint) {
        debugOutput?.add(entry);
        return injector.addPureImport(entry, hint);
      }

      // shared mutated-key enrichment: see `enrichMutatedStatics` for the model
      if (method === 'usage-pure') {
        enrichMutatedStatics({
          mutatedStatics,
          resolvePure: resolvePureUnfiltered,
          injectPureImport: (entry, hint) => injectPureImport(entry, hint),
        });
      }
      // early ctor-alias registration (visit-order independence) - see the babel twin. BOTH
      // usage modes: pure folds through the hints, usage-global resolves its injections
      if (method === 'usage-pure' || method === 'usage-global') {
        collectAliasPrePass({ ast, adapter: estreeAdapter, injector, isDisabled, census: fileCensus });
      }

      // one pass for every method, ahead of the emitters: a type instantiation sitting directly
      // under an optional call is the one shape whose SOURCE spelling a later lowering reads wrong,
      // so it is normalized here rather than left to whoever consumes the output. edits land on
      // `ms` before any queued transform, and both are point edits on type-only text no emitter
      // claims. this is the deliberate exception to "the spelling the author chose survives"
      // `?.` is a necessary condition for the shape, and cheaper to rule out than a walk: this pass
      // is the only one every method pays for, so files that cannot contain it skip it entirely
      if (code.includes('?.')) {
        traverse(ast, {
          CallExpression(path) {
            // an opt-out is an opt-out whatever the edit is FOR: the whole-file directive already
            // bails before this pass, and a line-scoped one has to reach it too, or the same
            // directive family would hold at file scope and be ignored at line scope
            if (isDisabled(path.node)) return;
            const instantiation = optionalCallInstantiationCallee(path.node);
            if (!instantiation) return;
            // the decision applied as node surgery: the instantiation dissolves into
            // the call's own type arguments and its operand becomes the callee
            path.node.typeArguments = instantiation.typeArguments ?? instantiation.typeParameters;
            path.node.callee = instantiation.expression;
            astNormalized = true;
          },
        });
      }

      const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

      // write-position bails for a property member usage: a for-x head target, and every other
      // write host the shared predicate enumerates - assignment LHS (compound included: the read
      // could be polyfilled, but the write would hit the const polyfill binding, so both halves
      // bail together), update operand, `delete` target (the consumer needs the SLOT), and the
      // destructuring write-only contexts. the other leg asks exactly this pair; spelled as its
      // own disjunction here it was one rule in two places, and only a probe told them apart
      function memberWritePositionBails(metaPath) {
        return isForXWriteTarget(metaPath, estreeAdapter) || isMemberWriteHost(metaPath);
      }

      // entry-global: the detection and disposition policy (`planEntries`) applied as body
      // surgery and printed. the debug report emits once per file (single pass)
      function runEntryGlobal() {
        const plan = planEntries(ast, { adapter: estreeAdapter, getCoreJSEntry, injectModulesForEntry, isDisabled });
        if (plan.found) debugOutput?.markEntryFound();
        outputDebug();
        // `found` mirrors babel's answer: a module-import input re-expands to itself -
        // this engine reprints like babel does, and the structural gate holds it to that
        // baseline rather than bailing to the untouched bytes
        if (!plan.found) return null;
        applyEntryProgram({
          program: ast,
          plan,
          modules: injector.globalImports,
          importStyle,
          pkg: injector.pkg,
          absoluteImports: injector.absoluteImports,
        });
        return finalizeAst();
      }

      // the print tail: the output does NOT re-emit a stripped BOM (babel's generator
      // carries none and bundlers strip it before the final artifact), but `sourcesContent`
      // keeps the user's ORIGINAL bytes - BOM included - because devtools compare it to disk
      // the directive re-anchor result (see `anchorDisableDirectives`): the print emits the
      // anchored texts verbatim and the loc-attached originals drop. a `pre` pass computes it
      // ahead of its no-op bail, every other print here - the anchors are keyed by node, so they
      // are read off the RESTORED tree, never the neutralized one
      let directiveAnchors = null;
      // undo the detection-convenience pattern neutralization (reverse order - the
      // parameter-property unwrap nests blanking inside itself) so the print and the anchor
      // walk see the author's tree; idempotent, so the pre paths may run it ahead of the print
      function restoreNeutralizedPatterns() {
        for (let i = patternRestorations.length - 1; i >= 0; i--) patternRestorations[i]();
        patternRestorations.length = 0;
      }
      // the anchors, off the restored tree: a property of a PARAMETER pattern is blanked for the
      // crawl, and an anchor keyed on the blanked copy would never meet its node in the printer
      function computeDirectiveAnchors() {
        restoreNeutralizedPatterns();
        directiveAnchors = anchorDisableDirectives({ ast, comments, code, offsetToLine, disabledLines });
      }
      function finalizeAst() {
        if (!directiveAnchors) computeDirectiveAnchors();
        const printed = printProgram({
          program: ast,
          comments: directiveAnchors ? comments.filter(comment => !directiveAnchors.removed.has(comment)) : comments,
          source: code,
          id,
          jsx: sourceDialect.jsx,
          anchoredComments: directiveAnchors?.anchored ?? null,
        });
        const { map } = printed;
        const outCode = printed.code;
        const content = map?.sourcesContent?.[0];
        if (content !== null && content !== undefined) {
          const original = preSplitCode ?? content;
          map.sourcesContent[0] = hasBOM ? `\uFEFF${ original }` : original;
        }
        // pre+post chaining: the bundler chains through pre's content-bearing map, so the
        // post map omits sourcesContent - the `includeContent: !chainedFromPre` rule,
        // applied to the printer's map
        if (map && pass === 'post' && inherit && inheritedPreRewrote) delete map.sourcesContent;
        return { code: outCode, map };
      }

      // the finalize() pre-store twin for the ast runners. the parse-reuse slots stay empty on
      // this engine: emission mutates the tree in place and only the detection conveniences
      // carry an undo ledger, so post re-parses its input instead of inheriting a mutated tree
      function storeAstPreSnapshot(preRewroteSource) {
        snapshots.store(id, {
          snapshot: injector.snapshot(),
          ast: null,
          comments: null,
          postInput: null,
          preRewroteSource,
          mutatedStatics,
        });
      }
      if (method === 'entry-global') return runEntryGlobal();

      const {
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isInStaticContext,
        isShadowedByClassOwnMember,
      } = createClassHelpers({ t: types, adapter: estreeAdapter, resolveKey: sharedResolveKey, getInjector: () => injector });

      // usage-global mode
      function collectUsageGlobal() {
        const usageGlobalCallback = createUsageGlobalCallback({
          adapter: estreeAdapter,
          resolveUsage,
          injectModulesForModeEntry,
          isDisabled,
          resolveStaticInheritedMember,
          isInheritedStaticLookup,
          isInStaticContext,
          isShadowedByClassOwnMember,
          enumerateFallbackBranches(meta, path) {
            return enumerateFallbackDestructureBranches(meta, path, estreeAdapter, { resolvePure, followIndirection: true });
          },
        });

        const usageVisitors = createUsageVisitors({
          adapter: estreeAdapter,
          onUsage: usageGlobalCallback,
          method,
          isEntryAvailable: isEntryNeeded,
          resolvePure,
        });
        const syntaxVisitors = createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });

        traverse(ast, mergeVisitors({
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          ...usageVisitors,
        }, syntaxVisitors));
      }

      // usage-global: the shared provider collection, the sweep's body
      // surgery already applied above, imports spliced in and printed. in `pre` the collection
      // rides the snapshot and the merged side-effect block lands ONCE in post (the
      // deferImports rule) - pre prints only what the sweep / normalization already changed
      function runUsageGlobal() {
        collectUsageGlobal();
        // pre stores its work in the snapshot and the post pass carries the union - emitting
        // the report from both passes would double-print every diagnostic (finalize's rule)
        if (pass !== 'pre') outputDebug();
        const surgeryChanged = !!astSweptImports || astNormalized;
        if (pass === 'pre') {
          computeDirectiveAnchors();
          const preChanged = surgeryChanged || !!directiveAnchors;
          storeAstPreSnapshot(preChanged);
          if (!preChanged) return null;
          return finalizeAst();
        }
        if (!injector.globalImports.size && !surgeryChanged) return null;
        injectImportStatements({
          program: ast,
          modules: injector.globalImports,
          importStyle,
          pkg: injector.pkg,
          absoluteImports: injector.absoluteImports,
        });
        return finalizeAst();
      }
      if (method === 'usage-global') return runUsageGlobal();

      // usage-pure (see usage-pure.js): shared detection visitors,
      // babel-blueprint emission; an unported class bails to the raw spelling, never to a
      // silently-wrong rewrite. pass-aware like its usage-global sibling: pre emits inline
      // (the self-contained rule) and stores the injector union, post dedups via the
      // existing-import re-scan
      function runUsagePure() {
        // `keepLive`: effect subtrees a render RE-EMITS BY IDENTITY - claims under them stay
        // live even inside consumed / detached spans, and land in place (the keep-live carve)
        const skippedNodes = Object.assign(new WeakSet(), { keepLive: new Set() });
        // a `_unused` sentinel carries its own declarator, so the flush owes it no `var` - but
        // it SHARES the minted-name family and must be in the census, or a sentinel the drain
        // dropped strands its slot and the survivors never renumber
        const astRefNames = [];
        const astRenameOnly = [];
        const astRefOrder = [];
        let astRewrote = false;
        // the `var` block lands at the top of the nearest enclosing BLOCK (babel's scope.push
        // placement - an if/catch body hosts its own refs); an expression-bodied arrow has no
        // block yet, so the FUNCTION node is recorded and the flush converts it; a use inside
        // PARAMS skips its function (the param scope cannot see body vars)
        // the canonical single-statement slots MINUS `LabeledStatement`: a label names the
        // statement it wraps, so a block minted in that slot would sit INSIDE the label and a
        // `continue` past the memo would re-enter it - the ref belongs outside the label
        const BODYLESS_HOST_SLOTS = new Map([...SINGLE_STATEMENT_SLOTS]
          .filter(([type]) => type !== 'LabeledStatement'));
        function refHostOf(metaPath) {
          for (let from = metaPath, cur = metaPath.parentPath; cur; from = cur, cur = cur.parentPath) {
            const { type } = cur.node ?? {};
            // a NAMESPACE body owns a var scope of its own (it compiles to an IIFE), so it
            // hosts the block exactly like a function body would
            if (BRACE_STATEMENT_HOST_TYPES.has(type)) {
              if (from.listKey === 'params' || from.key === 'params') continue;
              return { hostBlock: cur.node };
            }
            // a BODYLESS statement slot (a block-less loop / if body): babel's scope.push
            // creates the block, so the flush wraps the slot the same way
            const slots = BODYLESS_HOST_SLOTS.get(type);
            if (slots) {
              const slot = slots.find(key => cur.node[key] === from.node);
              // a `var` statement in the slot hoists its own bindings out of it, so the ref
              // block does too - bracing there would be a block nobody needs
              if (slot && from.node?.type !== 'BlockStatement'
                && !(from.node?.type === 'VariableDeclaration' && from.node.kind === 'var')) {
                return { hostBodyless: { parent: cur.node, slot } };
              }
            }
            if (type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression') {
              if (from.listKey === 'params' || from.key === 'params') continue;
              return { hostFunction: cur.node };
            }
          }
          return {};
        }
        const refFacade = {
          // an `_unused` sentinel for an ASSIGNMENT-position rename: it needs a real
          // declaration (`var _unused;`), which the flush hosts like any declared ref
          declareUnusedRef(metaPath) {
            const name = injector.uniqueName('_unused');
            astRefNames.push({ name, ...refHostOf(metaPath) });
            return name;
          },
          // a DUPLICATED subtree (a destructure receiver copy) carries the refs the walk
          // already planted inside it: a ref hosted by a FUNCTION of the copy has no
          // declaration there (the original's `var` sits in the original's own body), so it
          // re-mints against the copy's host. a ref at the copy's top level keeps its name -
          // its declaration is the shared enclosing scope and the two reads are sequential
          recloneDeclaredRefs(root) {
            const known = new Set(astRefNames.map(entry => entry.name));
            if (!known.size) return;
            const renamesByHost = new Map();
            (function walk(node, hostFn) {
              if (!node || typeof node !== 'object' || !node.type) return;
              const isFn = node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression'
                || node.type === 'ArrowFunctionExpression';
              const scopeFn = isFn ? node : hostFn;
              if (node.type === 'Identifier' && hostFn && known.has(node.name)) {
                if (!renamesByHost.has(hostFn)) renamesByHost.set(hostFn, new Map());
                const renames = renamesByHost.get(hostFn);
                if (!renames.has(node.name)) {
                  const fresh = injector.generateDeclaredRef();
                  renames.set(node.name, fresh);
                  astRefNames.push(hostFn.body?.type === 'BlockStatement'
                    ? { name: fresh, hostBlock: hostFn.body } : { name: fresh, hostFunction: hostFn });
                }
                node.name = renames.get(node.name);
                return;
              }
              // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
              for (const key in node) {
                const value = node[key];
                if (Array.isArray(value)) for (const item of value) walk(item, scopeFn);
                else walk(value, scopeFn);
              }
            })(root, null);
          },
          generateDeclaredRef(metaPath) {
            const name = injector.generateDeclaredRef();
            // the host is recorded as a NODE (block or function), never a body: the emission
            // may still replace an expression-bodied arrow's direct body node, so which body
            // hosts the `var` block is the flush's decision, made on the final tree
            astRefNames.push({ name, ...refHostOf(metaPath) });
            return name;
          },
        };
        const destructureEmit = createAstDestructureEmitter({
          adapter: estreeAdapter,
          injector: refFacade,
          injectorState: injector,
          injectPureImport,
          markRewrite() { astRewrote = true; },
          skippedNodes,
          markSubtreeSkipped,
          program: ast,
          resolvePure,
          resolveGlobalPolyfill,
          mintUnusedName() {
            const name = injector.uniqueName('_unused');
            astRenameOnly.push(name);
            return name;
          },
          // a drain-minted `_ref` joins the family CENSUS and renumbers with the rest, in print
          // order. what makes that work is the ONE exception the census draws: a generated memo
          // DECLARATION hoists above the statement it serves, so it ranks at its first READ, not
          // at its binding id - babel numbers the receiver memo at the point of the second read,
          // between the guards of the two properties that need it (`collectInjectorCensus`)
          mintRefName() {
            const name = injector.uniqueName('_ref');
            astRefOrder.push(name);
            return name;
          },
          paramDefaultNeverOverridden: typeResolvers.paramDefaultNeverOverridden,
          resolveNodeType: typeResolvers.resolveNodeType,
          resolvePropertyObjectType: typeResolvers.resolvePropertyObjectType,
          resolvedType: typeResolvers.resolvedType,
          toHint: typeResolvers.toHint,
          isDisabled,
          getDebugOutput: () => debugOutput,
        });
        const callback = createAstUsagePureCallback({
          adapter: estreeAdapter,
          destructureEmit,
          getDebugOutput: () => debugOutput,
          injector: refFacade,
          injectPureImport,
          isDisabled,
          isInTypeAnnotation,
          markRewrite() { astRewrote = true; },
          isShadowedByClassOwnMember,
          isThisReceiver,
          memberWritePositionBails,
          isInheritedStaticLookup,
          resolveStaticInheritedMember,
          isMutatedStatics: m => isMutatedStaticMeta(m, mutatedStatics),
          injectorState: injector,
          isEntryAvailable: isEntryNeeded,
          resolveGlobalPolyfill,
          resolveNodeType: typeResolvers.resolveNodeType,
          resolvedType: typeResolvers.resolvedType,
          toHint: typeResolvers.toHint,
          resolvePure,
          resolvePureOrGlobalFallback,
          semanticParentNode,
          skippedNodes,
        });
        traverse(ast, mergeVisitors({
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          CatchClause(path) { destructureEmit.extractCatchClause(path); },
          ForOfStatement(path) { destructureEmit.extractLoopLeft(path); },
          ForInStatement(path) { destructureEmit.extractLoopLeft(path); },
        }, createUsageVisitors({
          adapter: estreeAdapter,
          onUsage: callback,
          method,
          walkAnnotations: false,
          isEntryAvailable: isEntryNeeded,
          resolveMeta: resolvePure,
          resolvePure,
          // the AST engine mutates the tree in place, so an emission inside a DECORATOR
          // (walked manually, with nothing re-queued) hides the replacement's own claims
          // from the traversal - the second pass reaches them
          revisitDecorators: true,
        })));
        destructureEmit.drain();
        // pre stores its work in the snapshot and the post pass carries the union (finalize's rule)
        if (pass !== 'pre') outputDebug();
        const collected = injector.pureImports.size || injector.globalImports.size || astRefNames.length;
        // the re-anchor is computed BEFORE the no-op bail: a file whose only core-js-relevant
        // content is the disabled claim still transforms, or the sibling lowering eats the
        // in-pattern comment - or lays two covered siblings on separate lines - and post
        // re-claims the very read the user opted out
        if (pass === 'pre') computeDirectiveAnchors();
        if (!astRewrote && !collected && !astNormalized && !astSweptImports && !directiveAnchors) {
          if (pass === 'pre') storeAstPreSnapshot(false);
          return null;
        }
        flushIntoProgram({
          injector,
          program: ast,
          refNames: astRefNames,
          renameOnly: astRenameOnly,
          refOrder: astRefOrder,
        });
        const out = finalizeAst();
        // usage-pure emits its imports inline in pre (the self-contained `deferImports`
        // rule above): the snapshot still carries the injector union, so post
        // re-scans them as existing, dedups, and resumes name allocation where pre stopped
        if (pass === 'pre') storeAstPreSnapshot(true);
        return out;
      }
      if (method === 'usage-pure') return runUsagePure();
      return null;
    } finally {
      currentInjector = previousInjector;
      currentMutatedStatics = previousMutatedStatics;
      currentMutationRoots = previousMutationRoots;
      currentWrittenContainerSlots = previousWrittenContainerSlots;
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
