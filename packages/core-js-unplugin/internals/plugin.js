import { parseSync } from 'oxc-parser';
import { canonicalizeRefNumbering } from './ref-canon.js';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import { ownEmittedNavClaim, ownOutputTests, restSentinelNamesReducer } from '@core-js/polyfill-provider/detect-usage/own-output';
import {
  extractIndirectRequireSEPrefix,
  namespaceScopedBindingBlock,
  staticFallbackSwapRedundant,
  forEachStatementPosition,
  getMinifierSequenceDestructureExpressions,
  sequenceHeadDirectiveHazard,
  createTypeAnnotationChecker,
  detectCommonJS,
  hasTopLevelESM,
  isDeleteTarget,
  isForXWriteTarget,
  climbTransparentWrapperPath,
  isMemberWriteOnlyContext,
  isDeoptedGlobalSlotRead,
  mutatedSlotLeftNativeWarning,
  isMutatedStaticMeta,
  isMutatedStaticPair,
  isNonReferencePosition,
  isTaggedTemplateTag,
  collectFileCensus,
  methodReadsUsageCensus,
  memberKeyNamesReducer,
  mutatedGlobalSlotNames,
  BRACE_STATEMENT_HOST_TYPES,
  SINGLE_STATEMENT_SLOTS,
  isThisReceiver,
  isUpdateTarget,
  mayHaveSideEffects,
  peelNestedSequenceExpressions,
  peelToExpressionStatement,
  TS_EXPR_WRAPPERS,
  unwrapReceiverLeaf,
  unwrapRuntimeExpr,
  migratableClaimSe,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  enrichMutatedStatics, escapedCtorReferencesReducer, mutationShapesReducer,
} from '@core-js/polyfill-provider/detect-usage/mutations';
import {
  createClassHelpers, ctorAliasShapesReducer, remapInheritedStaticMeta, usableAliasInfo,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { tagError } from '@core-js/polyfill-provider/helpers/error-tag';
import { isCoreJSFile, stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import {
  buildOffsetToLine,
  buildOffsetToLineColumn,
  isLineBoundDisableDirective,
  mergeVisitors,
  parseDisableDirectives,
} from '@core-js/polyfill-provider/helpers/source-scan';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors } from '@core-js/polyfill-provider/plugin-options/inject';
import { createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options/usage-callback';
import { enumerateFallbackDestructureBranches } from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  descendToChainRoot, isAliasProxyHopChain, navHasUnresolvableProxyHop, peelChainAssignment,
  peelChainRootValue, peelReceiverSequenceTail, resolveKey as sharedResolveKey, resolveObjectName,
  storedUserAssignmentOf, undefinableOptionalGuard,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  harvestDiscardedReceiverSE, isSourcedSymbolIteratorMeta, planGuardedStaticNarrow, shouldDropRescueReceiver,
} from '@core-js/polyfill-provider/detect-usage/members';
import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage/annotations';
import { scanExistingCoreJSImports } from '@core-js/polyfill-provider/detect-usage/entries';
import { isForInitDeclaration } from '@core-js/polyfill-provider/destructure-host-shape';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue from './transform-queue.js';
import detectEntries, { createTopLevelStatementRewriter, planEntries } from './detect-entry.js';
import applyEntryProgram, { injectImportStatements } from './ast/entry.js';
import { printProgram, shiftFirstLineColumns } from './ast/print.js';
import { flushIntoProgram } from './ast/import-injector.js';
import createAstDestructureEmitter from './ast/destructure.js';
import createAstUsagePureCallback, { markSubtreeSkipped } from './ast/usage-pure.js';
import {
  closestVisibleNativeBinding,
  withoutPhantomDeclarationViolations,
  collectAliasPrePass, collectMutationPrePass,
  createEstreeAdapter,
  createUsageVisitors,
  createSyntaxVisitors,
} from './detect-usage.js';
import ScopeTracker from './scope-tracker.js';
import { isCallee, optionalCallTypeArgumentEdits, outerGuardOwnedRoot, unwrapNode } from './emit-utils.js';
import { collapseStandownRoot, createPolyfillEmitter } from './polyfill-emitter.js';
import { createDestructureEmitter } from './destructure-emitter.js';
import {
  walkAstNodes,
  asiFusableStatementStarts,
  bindingNamesReducer,
  directivePrologueEnd,
  hasCoreJSImport,
  isBodylessStatementBody,
  isChunkLoaderBundler,
  isDirectiveStatement,
  KNOWN_BUNDLERS,
  lastUserImportEnd,
  liftSfcLangSuffix,
  parenthesizeExprStmtHazard,
  sourceDialectOf,
  statementOverwriteFusesLeft,
  stripLeadingBOMs,
} from './plugin-helpers.js';
import SnapshotCache from './snapshot-cache.js';
import { setLexDialect } from './text-scan.js';

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
// `restorations` (AST engine only): the neutralization is a DETECTION convenience - the text
// engine never prints the tree, but the AST engine does, and a blanked rest argument or an
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
  for (const value of Object.values(node)) neutralizeUnwalkedParamPatterns(value, restorations);
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
  let { parentPath } = metaPath;
  while (parentPath?.node && (parentPath.node.type === 'ParenthesizedExpression'
    || parentPath.node.type === 'ChainExpression'
    || TS_EXPR_WRAPPERS.has(parentPath.node.type))) {
    parentPath = parentPath.parentPath;
  }
  return parentPath?.node;
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
  // an un-braced control-flow body holds its statement in a single slot, so its split products have
  // nowhere to go until the slot is braced. both position kinds come from ONE walk, and the brace is
  // emitted in this same pass - a block around a sequence's operands declares nothing, so the added
  // scope is unobservable
  function collect(stmt, brace) {
    const expressions = getMinifierSequenceDestructureExpressions(stmt);
    if (expressions) matches.push({ start: stmt.start, end: stmt.end, expressions, brace });
  }
  forEachStatementPosition(ast, {
    onList(statements) {
      for (const stmt of statements) collect(stmt, false);
    },
    onUnbracedSlot(hostNode, key) {
      collect(hostNode[key], true);
    },
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
      // position and silently flips the enclosing block into strict mode; a TS cast vanishes at
      // type-strip so it doesn't protect the string, while explicit parens survive this text
      // emit and do. a `0,` sequence prefix keeps the hazardous form a plain expression
      // statement (matches the babel-plugin split)
      if (index === 0 && sequenceHeadDirectiveHazard(expr)) return `0, ${ slice };`;
      return `${ parenthesizeExprStmtHazard(slice) };`;
      // single-line join: every split product inherits the ORIGINAL statement's line, so a
      // `core-js-disable-next-line` above the collapsed statement covers ALL of them (the
      // babel split carries origin loc onto its products - this is the text-engine twin)
    }).join(' ');
    // left-boundary ASI guard: the statement was detected separate against its ORIGINAL leading `(`
    // (which ASI-splits a postfix `++` / `--` prev), but the split's FIRST product re-roots the line on a
    // hazard char (`+eff()` / `/re/...`) that the prev no longer separates from - inject the `;` to keep
    // them two statements (and so the re-parse below doesn't choke on the fused form and abandon the split)
    if (!match.brace && statementOverwriteFusesLeft(code, match.start, splitText[0])) mutated.prependLeft(match.start, ';');
    mutated.overwrite(match.start, match.end, match.brace ? `{ ${ splitText } }` : splitText);
    lastKeptEnd = match.end;
  }
  return mutated.toString();
}

// a disable directive attached INSIDE a destructuring pattern dies in a sibling pass's
// lowering between `pre` and `post` (babel drops property-attached comments and reflows the
// survivors), and post then re-claims the very read the user opted out. the text engine
// survives by construction: its splice rebuilds the statement under the comment's line. here
// the directive re-anchors EXPLICITLY: the comment leaves the loc-attached channel and the
// printer emits `// core-js-disable-next-line` verbatim on its own line ahead of the
// statement (both source spellings - a leading `-next-line` and a trailing `-line` - land as
// the leading form, whose covered line is the statement's first). meaning-preserving ONLY
// for the sole-prop chain whose whole remainder sits on the directive's covered line:
// everything the statement lowers to derives from that disabled prop, so statement scope IS
// the directive's scope. wider shapes keep the author's placement (a hoist would widen or
// lose the opt-out). the walk covers POSITIONED hosts too - statements no emission rebuilt -
// because their in-pattern comment dies in the same lowering; the text consumer
// (`spliceDirectiveAnchors`) needs the covering comments per statement, hence `nodeComments`
function hoistSoleDisabledPatternDirectives({ ast, comments, offsetToLine, disabledLines }) {
  if (!comments?.length || !disabledLines || disabledLines === true) return null;
  const anchored = new Map();
  const removed = new Set();
  const nodeComments = new Map();
  walkAstNodes({ root: ast, visit(node) {
    if (node.type === 'VariableDeclaration' && node.declarations.length === 1) {
      const [{ id }] = node.declarations;
      const [prop = null] = id?.type === 'ObjectPattern' && id.properties.length === 1 ? id.properties : [];
      const usable = prop && typeof prop.start === 'number' && typeof prop.end === 'number';
      const line = usable ? offsetToLine(prop.start) : null;
      if (usable && disabledLines.has(line) && offsetToLine(prop.end - 1) === line) {
        for (const comment of comments) {
          if (typeof comment.start !== 'number' || !isLineBoundDisableDirective(comment.value)) continue;
          const commentLine = offsetToLine(comment.end - 1);
          const covers = comment.value.includes('next-line') ? commentLine + 1 === line : commentLine === line;
          if (!covers) continue;
          if (!anchored.has(node)) {
            anchored.set(node, []);
            nodeComments.set(node, []);
          }
          anchored.get(node).push('// core-js-disable-next-line');
          nodeComments.get(node).push(comment);
          removed.add(comment);
        }
      }
    }
  } });
  return anchored.size ? { anchored, removed, nodeComments } : null;
}

// the text-splice consumer of `hoistSoleDisabledPatternDirectives`: a POSITIONED host (a
// statement no queued edit rebuilt) keeps the author's in-pattern placement, which dies in
// the sibling lowering between the passes - re-anchor by splice: drop the covering comment,
// lead the statement with the canonical form. a rebuilt statement is left alone: the splice
// there already re-roots the comment's line (and its ranges may no longer split)
function spliceDirectiveAnchors({ ms, code, anchors }) {
  if (!anchors) return;
  function untouched(start, end) {
    try {
      return ms.slice(start, end) === code.slice(start, end);
    } catch {
      return false;
    }
  }
  for (const [node, texts] of anchors.anchored) {
    if (!untouched(node.start, node.end)) continue;
    for (const comment of anchors.nodeComments.get(node) ?? []) {
      if (untouched(comment.start, comment.end)) ms.remove(comment.start, comment.end);
    }
    ms.prependLeft(node.start, `${ texts.join('\n') }\n`);
  }
}

// disable-directive state for a (code, ast, comments) snapshot: the offset->line mapper
// plus the parsed line set. `disable-file` only counts above any code - a `'use strict'`
// prologue can precede it, so directives before the cutoff are skipped
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
    getPolyfillBindingEntry: (scope, name) => usableAliasInfo(currentInjector?.getBindingInfo?.(name))?.entry ?? null,
    getPolyfillBindingHint: (scope, name) => usableAliasInfo(currentInjector?.getBindingInfo?.(name))?.hint ?? null,
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
  const { bundler, engine: engineOption, ...providerOptions } = options;
  if (bundler !== undefined && bundler !== null && !KNOWN_BUNDLERS.has(bundler)) {
    const list = [...KNOWN_BUNDLERS].map(b => `'${ b }'`).join(', ');
    // eslint-disable-next-line no-console -- first-run diagnostic
    console.warn(`[core-js] unknown \`bundler\` ${ JSON.stringify(bundler) } - falling back to generic handling (expected one of ${ list })`);
  }
  // the transform-engine flag of the staged AST-engine migration. per-instance, so the
  // snapshot cache below can never mix engines - no key extension needed. every method is
  // landed on `'ast'` - each was rejected here at configuration time until its two gates
  // (the fixture gate and the differential's AST leg) went green
  const engine = engineOption ?? 'text';
  if (engine !== 'text' && engine !== 'ast') {
    const got = typeof engineOption === 'string' ? `'${ engineOption }'` : typeof engineOption;
    throw new TypeError(`[core-js] invalid \`engine\` option: ${ got } - expected 'text' or 'ast'`);
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
    resolveUsage, resolvePure: resolvePureUnfiltered, resolvePureOrGlobalFallback,
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
    // every lexer-aware walk over this file's text - and over the text composed from it -
    // lexes in the file's dialect: JSX where the parser admits it, the Annex B HTML-like
    // comments where the parse goal is a script. one file, one dialect, held for the transform
    const previousDialect = setLexDialect(sourceDialectOf(liftSfcLangSuffix(id)));
    try {
      // thread bundler's `this` (Vite/Rollup/Webpack stage context with `.warn`) through
      // to runTransformInner so internal warnings reach the bundler's diagnostic channel.
      // injector save/restore happens INSIDE runTransformInner so early-returns before
      // its installation point don't disturb a re-entrant outer transform's slot
      return runTransformInner.call(this, code, id, pass);
    } catch (error) {
      tagError(error, id);
      throw error;
    } finally {
      setLexDialect(previousDialect);
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
    const patternRestorations = engine === 'ast' ? [] : null;
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
      // gate on pre-output fingerprint - direct post calls without a prior pre shouldn't
      // adopt coincidental user-source `_ref = ...` as if they were leftover from our pipeline.
      // filter against `declaredNames` (decls + non-orphan assignments only) - `bindingNames`
      // also includes Identifier reads, which always contains the orphan target itself and
      // would make the filter dead code (every plugin-emitted `_ref` reads its own slot)
      // canonical `_refN` numbering eligibility: single-pass files only. a pre pass's refs
      // live in the NEXT pass's original text (out of rename reach), and adopted orphans
      // keep their spellings for the same reason - those files keep allocation numbering.
      // user slot-shaped names do NOT disable the canon: the allocator reserved them and
      // `isRefSlotForeign` keeps their slots out of the assignment, exactly like the AST
      // emitter's taken-aware renumber - skipping here instead desynced the two numberings
      let refCanonEligible = pass !== 'pre' && !inherit;
      // `readsCensus` is the LOCAL statement of this block's dependency: it reads census-only
      // collections, and the method that skips the census hands back a shape without them. today
      // that method also forces `pass: 'single'`, so the phase test alone would keep this
      // unreachable - but resting on a distant, unrelated guard turns a future phase change into a
      // TypeError here instead of the degrade the empty shape is meant to give
      if (readsCensus && pass === 'post' && !inherit && hasCoreJSImport(ast, packages)) {
        const adoptable = new Set();
        for (const ref of orphanRefs) if (!declaredNames.has(ref)) adoptable.add(ref);
        if (adoptable.size) refCanonEligible = false;
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
      // entry-global handles re-emit via detectEntries - skip there. otherwise scan
      // unconditionally: post-with-inherit ALSO needs this because a sibling plugin
      // may have INJECTED new core-js imports between our pre and post (sibling preset
      // adding `import 'core-js/modules/X'` for a transform it generated). pre's snapshot
      // captured user imports as of pre-time; sibling-inserted ones arrive AFTER and
      // would slip past dedup if we trusted inherit alone. re-running scan re-registers
      // them safely - the injector's dedup filter ignores already-registered entries
      // the top-level statement rewriter of this file: the usage sweep hands it the user core-js
      // imports it removes, and every later channel that writes at a statement head asks it (through
      // the queue) what the previous SURVIVING char is - the removals are not in the source text
      const statementRewriter = createTopLevelStatementRewriter(ms);
      // the AST engine's change tracker - its `ms.hasChanged()` twin: body surgery and node
      // normalization leave no text trace, so the abstain decision reads these
      let astSweptImports = false;
      let astNormalized = false;
      if (method !== 'entry-global') {
        const removed = new Set();
        scanExistingCoreJSImports(ast, {
          adapter: estreeAdapter,
          mode,
          // the user's global import is REMOVED here and re-emitted through `addGlobalImport`,
          // so nothing may suppress it as already-present. the DEFER pass leaves user global
          // imports COMPLETELY alone (no removal, no registration): its own emission is
          // deferred to post, so removing here would strand the file import-less if the post
          // pass never lands (evicted snapshot / sibling bail / watch-mode re-run)
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
          // require (`0, (spy(), require)('core-js/X')`) keeps its side-effect prefix (outer sequence AND
          // callee) as bare statements via the same rewriter the entry path uses; the node STAYS in the
          // AST re-pointed at that prefix, so the syntax visitor still polyfills any usage inside the kept
          // prefix (`(arr.includes(1), require)(...)` -> `es.array.includes` injected)
          const kept = new Set();
          for (const node of removed) {
            // the AST engine takes only the DECISION half - the text batch renders nothing here
            const sePrefix = engine === 'ast' ? extractIndirectRequireSEPrefix(node) : statementRewriter.remove(node);
            if (!sePrefix.length) continue;
            kept.add(node);
            node.expression = sePrefix.length === 1 ? sePrefix[0] : { type: 'SequenceExpression', expressions: sePrefix };
          }
          if (engine === 'text') statementRewriter.apply();
          else astSweptImports = true;
          ast.body = ast.body.filter(n => !removed.has(n) || kept.has(n));
          // the ref block anchors after the trailing user import - of the body as it now stands: a
          // removed import is no anchor, and a kept prefix is a plain statement, not an import-like
          // one the refs should land behind
          injector.userImportEnd = lastUserImportEnd(ast);
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

      // resolve a bare global name (`Array`, `Promise`, `globalThis`) to its pure polyfill
      // binding info; null when not polyfillable as a global. shared between the polyfill
      // emitter and the destructure emitter, on both engines
      function resolveGlobalPolyfill(name) {
        const pure = resolvePure({ kind: 'global', name });
        return pure && pure.kind !== 'instance' ? pure : null;
      }

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
      // early ctor-alias registration (visit-order independence) - see the babel twin. BOTH
      // usage modes: pure folds through the hints, usage-global resolves its injections
      if (method === 'usage-pure' || method === 'usage-global') {
        collectAliasPrePass({ ast, adapter: estreeAdapter, injector, isDisabled, census: fileCensus });
      }

      function finalize() {
        injector.flush();
        // an opted-out read's directive must reach the post pass's parse alive (the entry
        // method rewrites imports, not member claims - nothing to protect there)
        if (pass === 'pre' && method !== 'entry-global') {
          spliceDirectiveAnchors({
            ms, code,
            anchors: hoistSoleDisabledPatternDirectives({ ast, comments, offsetToLine, disabledLines }),
          });
        }
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
            // semantic slot keys for post's mutation-set union - see the recompute site
            mutatedStatics,
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
        // fires, devtools resolve a generated position through the splitCode-anchored mapping but
        // display preSplitCode text, so every mapped position can land on the wrong line AND column
        // by however much the split shifted that code - a per-position drift (the split can spread one
        // minified line across many), NOT a uniform offset. that misalignment is the cost of keeping
        // sourcesContent == input. proper fix (compose split-pass map with post-pass map via
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
            const edits = optionalCallTypeArgumentEdits(path.node, code);
            if (!edits) return;
            if (engine === 'ast') {
              // the same decision, applied as node surgery: the instantiation dissolves into
              // the call's own type arguments and its operand becomes the callee
              path.node.typeArguments = edits.instantiation.typeArguments ?? edits.instantiation.typeParameters;
              path.node.callee = edits.instantiation.expression;
              astNormalized = true;
              return;
            }
            ms.remove(edits.remove.start, edits.remove.end);
            ms.appendLeft(edits.insert.pos, edits.insert.content);
          },
        });
      }

      // shared by BOTH usage-pure engines (the text callback and the AST port)
      const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

      // write-position bails for a property member usage: update / for-x targets, any
      // AssignmentExpression LHS - including compound (`obj.at += X`; the read could be
      // polyfilled, but the write would hit the const polyfill binding - bail to keep both
      // halves consistent) - and the shared write-only destructure contexts (default-pattern
      // `{a: obj.at = 1}`, array-pattern `[obj.at] = src`, and the assignment-target shape
      // parsers emit as ArrayExpression: `[super.from] = src` would otherwise rewrite to a
      // frozen import binding and throw "Assignment to constant variable" at runtime)
      function memberWritePositionBails(node, parent, metaPath) {
        // the write host's `.left` points at the OUTERMOST transparent wrapper when the member
        // is wrapped (`(obj.at as any) = fn`) - compare against the climbed anchor, and hand the
        // write-only gate the anchor's own parent window so its slot identities line up
        const anchor = climbTransparentWrapperPath(metaPath);
        // ... and a `delete` target is write-only in the same sense: the consumer needs the SLOT,
        // so a claim that replaces the member with a call would delete nothing and run the helper
        // besides (`delete g[Symbol.iterator]` keeps the member, its key swapped)
        return isUpdateTarget(parent) || isForXWriteTarget(metaPath)
          || (parent?.type === 'AssignmentExpression' && parent.left === anchor.node)
          || (isDeleteTarget(anchor.parentPath?.node) && anchor.parentPath.node.argument === anchor.node)
          || isMemberWriteOnlyContext(anchor.node, anchor.parentPath?.node, anchor.parentPath?.parentPath?.node);
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

      // the AST engine's entry-global: the same detection and disposition policy
      // (`planEntries`), applied as body surgery and printed - the text finalize with its
      // MagicString tail never runs here. debug parity mirrors `finalize` (single pass)
      function runEntryGlobalAst() {
        const plan = planEntries(ast, { adapter: estreeAdapter, getCoreJSEntry, injectModulesForEntry, isDisabled });
        if (plan.found) debugOutput?.markEntryFound();
        outputDebug();
        // `found` mirrors babel's answer, not the text engine's: a module-import input
        // re-expands to itself, and the text leg then returns null only because its net
        // edits happen to be byte-identical (MagicString's hasChanged). this engine reprints
        // like babel does - the structural gate holds it to that baseline
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

      // the AST engine's print tail - `finalize`'s MagicString twin: re-prepend the BOM
      // (shifting the first output line's columns by the one char), and keep
      // `sourcesContent` the user's ORIGINAL bytes when the minifier split rewrote the input
      // the pre-pass directive re-anchor result (see `hoistSoleDisabledPatternDirectives`):
      // the print emits the anchored texts verbatim and the loc-attached originals drop
      let directiveAnchors = null;
      function finalizeAst() {
        // undo the detection-convenience pattern neutralization (reverse order - the
        // parameter-property unwrap nests blanking inside itself) so the print sees the
        // author's tree
        for (let i = patternRestorations.length - 1; i >= 0; i--) patternRestorations[i]();
        patternRestorations.length = 0;
        const printed = printProgram({
          program: ast,
          comments: directiveAnchors ? comments.filter(comment => !directiveAnchors.removed.has(comment)) : comments,
          source: code, id, jsx: sourceDialect.jsx,
          anchoredComments: directiveAnchors?.anchored ?? null,
        });
        const { map } = printed;
        let outCode = printed.code;
        if (hasBOM) {
          outCode = `\uFEFF${ outCode }`;
          shiftFirstLineColumns(map, 1);
        }
        const content = map?.sourcesContent?.[0];
        if (content !== null && content !== undefined) {
          const original = preSplitCode ?? content;
          map.sourcesContent[0] = hasBOM ? `\uFEFF${ original }` : original;
        }
        // pre+post chaining: the bundler chains through pre's content-bearing map, so the
        // post map omits sourcesContent - the `includeContent: !chainedFromPre` rule of the
        // text finalize, applied to the printer's map
        if (map && pass === 'post' && inherit && inheritedPreRewrote) delete map.sourcesContent;
        return { code: outCode, map };
      }

      // the finalize() pre-store twin for the ast runners. the parse-reuse slots stay empty on
      // this engine: emission mutates the tree in place and only the detection conveniences
      // carry an undo ledger, so post re-parses its input instead of inheriting a mutated tree
      function storeAstPreSnapshot(preRewroteSource) {
        snapshots.store(id, {
          snapshot: injector.snapshot(),
          ast: null, comments: null, postInput: null,
          preRewroteSource,
          mutatedStatics,
        });
      }
      if (method === 'entry-global') return engine === 'ast' ? runEntryGlobalAst() : runEntryGlobal();

      const {
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isInStaticContext,
        isShadowedByClassOwnMember,
      } = createClassHelpers({ t: types, adapter: estreeAdapter, resolveKey: sharedResolveKey, getInjector: () => injector });

      // usage-global mode
      function collectUsageGlobal() {
        const usageGlobalCallback = createUsageGlobalCallback({
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

      function runUsageGlobal() {
        collectUsageGlobal();
        return finalize();
      }

      // the AST engine's usage-global: the same engine-neutral collection, the sweep's body
      // surgery already applied above, imports spliced in and printed. in `pre` the collection
      // rides the snapshot and the merged side-effect block lands ONCE in post (the
      // deferImports rule) - pre prints only what the sweep / normalization already changed
      function runUsageGlobalAst() {
        collectUsageGlobal();
        // pre stores its work in the snapshot and the post pass carries the union - emitting
        // the report from both passes would double-print every diagnostic (finalize's rule)
        if (pass !== 'pre') outputDebug();
        const surgeryChanged = !!astSweptImports || astNormalized;
        if (pass === 'pre') {
          directiveAnchors = hoistSoleDisabledPatternDirectives({ ast, comments, offsetToLine, disabledLines });
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
      if (method === 'usage-global') return engine === 'ast' ? runUsageGlobalAst() : runUsageGlobal();

      // the AST engine's usage-pure (see ast/usage-pure.js): shared detection visitors,
      // babel-blueprint emission; an unported class bails to the raw spelling, never to a
      // silently-wrong rewrite. pass-aware like its usage-global sibling: pre emits inline
      // (the self-contained rule) and stores the injector union, post dedups via the
      // existing-import re-scan
      function runUsagePureAst() {
        // `keepLive`: effect subtrees a render RE-EMITS BY IDENTITY - claims under them stay
        // live even inside consumed / detached spans, and land in place (the keep-live carve)
        const skippedNodes = Object.assign(new WeakSet(), { keepLive: new Set() });
        // a `_unused` sentinel carries its own declarator, so the flush owes it no `var` - but
        // it SHARES the minted-name family and must be in the census, or a sentinel the drain
        // dropped strands its slot and the survivors never renumber
        const [astRefNames, astRenameOnly, astRefOrder] = [[], [], []];
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
              for (const value of Object.values(node)) {
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
          // between the guards of the two properties that need it (`collectLiveness`)
          mintRefName() {
            const name = injector.uniqueName('_ref');
            astRefOrder.push(name);
            return name;
          },
          paramDefaultNeverOverridden: typeResolvers.paramDefaultNeverOverridden,
          resolveNodeType: typeResolvers.resolveNodeType,
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
        // in-pattern comment and post re-claims the very read the user opted out
        if (pass === 'pre') directiveAnchors = hoistSoleDisabledPatternDirectives({ ast, comments, offsetToLine, disabledLines });
        if (!astRewrote && !collected && !astNormalized && !astSweptImports && !directiveAnchors) {
          if (pass === 'pre') storeAstPreSnapshot(false);
          return null;
        }
        flushIntoProgram({
          injector, program: ast, refNames: astRefNames, renameOnly: astRenameOnly, refOrder: astRefOrder,
        });
        const out = finalizeAst();
        // usage-pure emits its imports inline in pre (the self-contained rule the text leg
        // spells at `deferImports`): the snapshot still carries the injector union, so post
        // re-scans them as existing, dedups, and resumes name allocation where pre stopped
        if (pass === 'pre') storeAstPreSnapshot(true);
        return out;
      }
      if (method === 'usage-pure' && engine === 'ast') return runUsagePureAst();

      // usage-pure mode
      function runUsagePure() {
      // skippedNodes semantics (implicit contract across ~10 call sites):
      // 1. "don't re-visit this node" - stale visits after a parent rewrite shouldn't re-fire
      // 2. "this node is already handled by a composite rewrite" - inner members in a combined
      //    chain, RHS of `in` expression after fold to `true`
      // 3. "don't emit polyfill for this identifier" - receiver Identifier of a known member
      // a single WeakSet covers all three because the downstream check is the same: any visitor
      // that sees a node in the set exits early. keep this in mind when adding new usages
        // `keepLive`: effect subtrees a render RE-EMITS BY IDENTITY - claims under them stay
        // live even inside consumed / detached spans, and land in place (the keep-live carve)
        const skippedNodes = Object.assign(new WeakSet(), { keepLive: new Set() });
        // members of a raw `_ref.`-rebound / guard-reuse receiver tail. weaker than `skippedNodes`:
        // member/static/global rewrites on these nodes are suppressed (the raw tail re-emits their
        // source verbatim, so a substitution would desync from it - `_self.X` vs the emitted
        // `_ref.self.X`), but an INSTANCE dispatch stays live - it emits its own transform and
        // composes into the rebound tail through the outer guard's rootRaw/guardRef needle rebuild
        // (babel reaches the same shape by AST mutation: `_nameMaybeFunction(_ref.foo)`)
        const rebindTailMembers = new WeakSet();
        // no fileId arg: transform-queue throws are unbranded (`transform-queue: <msg>`); the outer
        // catch's `tagError(error, id)` owns the single `[core-js] [<id>] ` brand + file tag
        const transforms = new TransformQueue(code, ms, () => asiFusableStatementStarts(ast), statementRewriter.prevSurvivingChar);
        // composition locates an inner rewrite whose head the outer already resolved; only names
        // the injector minted count as that resolution, never a user identifier of the same shape
        transforms.useBindingHints(name => injector.getPureImport(name)?.hint ?? null);

        // per-traversal scope state for `var _ref;`-style refs. setScope() runs before each
        // callback; genRef() reads the current scope. drainInto() drains accumulated
        // arrow / scoped vars after the traverse pass. instance + destructure emitters both
        // read scope position + allocate refs through this single tracker
        const scopeTracker = new ScopeTracker({ code, injector });

        // a ctor STATIC (`Number.MAX_SAFE_INTEGER` -> `_Number$MAX_SAFE_INTEGER`, `Array.of` -> `_Array$of`):
        // the receiver-independent collapse under a kept proxy guard needs this to substitute a static reached
        // THROUGH a ctor hop (`(w = globalThis.window)?.Number.MAX_SAFE_INTEGER`), where the ctor itself carries
        // no pure global entry. `resolveGlobalPolyfill` is name-only and misses it - resolve the property meta
        function resolveStaticPolyfill(object, key) {
          const pure = resolvePure({ kind: 'property', object, key, placement: 'static' });
          return pure && pure.kind === 'static' ? pure : null;
        }

        // polyfill emission pipeline. covers all kinds dispatched from the usage-pure visitor:
        // instance-method member-calls (with optional-chain handling, Symbol.iterator special
        // path, receiver-polyfill substitution, chain composition), global / static member
        // rewrites, and `in` expression rewrites. factory in `internals/polyfill-emitter.js`
        // captures the closure deps below; public entries become local consts so existing
        // call sites stay unchanged
        const emitter = createPolyfillEmitter({
          resolveNodeType: typeResolvers.resolveNodeType,
          toHint: typeResolvers.toHint,
          code,
          estreeAdapter,
          injectPureImport,
          isEntryNeeded,
          isInStaticContext,
          isShadowedByClassOwnMember,
          mutatedStatics,
          resolveGlobalPolyfill,
          resolveStaticPolyfill,
          resolvePureOrGlobalFallback,
          resolveStaticInheritedMember,
          scopeTracker,
          skippedNodes,
          rebindTailMembers,
          transforms,
        });
        const {
          collapseStoredKeptAssign,
          handleInExpression,
          handleSymbolIterator,
          nodeSrc,
          replaceGlobalOrStatic,
          replaceInstance,
          renderKeptNavValue,
          collapseDeleteTargetNav,
          collapsePlainCallRootedNav,
          replaceStaticFallback,
          resolveReceiverSource,
          sealedNavReceiverSrc,
          sealedThrowProbePrefix,
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
          isEntryNeeded,
          nodeSrc,
          resolveGlobalPolyfill,
          resolveNodeType: typeResolvers.resolveNodeType,
          toHint: typeResolvers.toHint,
          resolvePure,
          resolveReceiverSource,
          sealedNavReceiverSrc,
          sealedThrowProbePrefix,
          scopeTracker,
          skippedNodes,
          source: code,
          transforms,
        });
        const {
          applyDestructuringTransforms,
          applySynthSwaps,
          canFullyConsumeProxyDeclarator,
          collapseProxyHopRoot,
          handleDestructuringPure,
          markLiftedSePrefixOperand,
          tryFlattenProxyHopHost,
        } = destructureEmitter;

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

        // does any member of this chain read a ponyfillable ctor static (`Number.MAX_SAFE_INTEGER`)?
        // such a member is claimed as a whole-span replacement, so no receiver text survives under it.
        // the pair is read through the two resolvers the claim itself uses rather than a private
        // spelling, so the gate and the claim cannot answer differently as either side grows
        function chainCarriesCtorStatic(node, ctx) {
          for (let cur = node; cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression'; cur = cur.object) {
            const key = cur.computed
              ? sharedResolveKey({ node: peelReceiverSequenceTail(cur.property), computed: true, ...ctx })
              : cur.property?.type === 'Identifier' ? cur.property.name : null;
            const objectName = key && resolveObjectName({ objectNode: cur.object, ...ctx });
            if (objectName && resolveStaticPolyfill(objectName, key)) return true;
          }
          return false;
        }

        // collapse the proxy hop of an ALIAS-rooted chain whose leaf is NON-polyfilled (`const g =
        // globalThis; new g.self.Array(3)` / `g['self'].Array.isArray(...)`): no leaf usage and no
        // `kind:'global'` trigger reaches the alias root, so the redundant `.self` / `.window` hop survives
        // and reads an undefined hop off the alias off-engine. `isAliasProxyHopChain` is the shared provider
        // detection; peel to the root path and collapse (which self-gates on the hop again). ALSO fired
        // for a RESOLVED instance dispatch (its verbatim receiver claim hosts the collapse as a nested
        // compose) - the skippedNodes root guard keeps a chain with several triggering metas
        // (`g.self.Array...includes.call(...)` - the unresolved `.call` property meta plus the resolved
        // `includes` instance meta) from queueing the same whole-span replacement twice
        function tryCollapseAliasProxyHop(node, metaPath) {
          const aliasCtx = metaPath?.scope ? { scope: metaPath.scope, adapter: estreeAdapter, path: metaPath } : null;
          if (!isAliasProxyHopChain(node, aliasCtx, true)) return;
          // this drive only works because a claim re-emits its receiver VERBATIM: the collapse is queued as
          // an INNER span and composes into that verbatim text. a chain-assign whose VALUE navigates a hop
          // with no ponyfill entry is the one shape the claim does NOT re-emit - it renders that receiver
          // itself (the shared plan keeps the assignment as its own root and drops the hop), so the inner
          // span has no text left to land in and composition throws. stand down there: the claim has
          // already done exactly this work. a chain-assign over a plain alias (`(d = g).self.X`) IS
          // re-emitted verbatim and still needs this drive
          if (navHasUnresolvableProxyHop(peelChainAssignment(descendToChainRoot(node).root).value,
            resolvePureUnfiltered)) return;
          // the same precondition, violated a second way: a ctor STATIC further down the chain
          // (`g.self.Number.MAX_SAFE_INTEGER`) carries its own claim, and that claim ERASES the
          // receiver instead of re-emitting it. the collapse queued below would then compose
          // against text the claim deleted, and the build aborts
          if (chainCarriesCtorStatic(node, aliasCtx)) return;
          let rootPath = metaPath;
          while (rootPath.node.type === 'MemberExpression' || rootPath.node.type === 'OptionalMemberExpression') {
            rootPath = rootPath.get('object');
          }
          if (skippedNodes.has(rootPath.node)) return;
          collapseProxyHopRoot(rootPath);
        }

        // runtime ctor guard render: the DECISION is the shared provider plan; this only
        // composes the text - `(M === _Map ? _Map$groupBy : M.groupBy)`, a callee raw branch
        // binding `this` via `.bind(M)`. the member subtree is skip-marked so the natural
        // visitors never queue a competing transform into the overwritten span
        function emitGuardedStaticNarrow(meta, metaPath, parent) {
          const memberNode = metaPath.node;
          const plan = planGuardedStaticNarrow({ memberNode, parent, meta, path: metaPath, resolvePure });
          if (!plan) return false;
          if (plan.bail) return true;
          // an effectful sequence prefix on the receiver runs ONCE, ahead of the test, exactly where
          // the source runs it - so the raw branch reads off the bare identifier instead of carrying
          // the sequence into a branch that only sometimes runs
          const memberSrc = plan.seqPrefix.length
            ? `${ plan.recvIdent.name }${ code.slice(memberNode.object.end, memberNode.end) }`
            : code.slice(memberNode.start, memberNode.end);
          const rawBranch = plan.isCallee ? `${ memberSrc }.bind(${ plan.recvIdent.name })` : memberSrc;
          const prefixSrc = plan.seqPrefix.map(expr => `${ code.slice(expr.start, expr.end) }, `).join('');
          walkAstNodes({ root: memberNode, visit: n => skippedNodes.add(n) });
          // one branch per candidate ctor, innermost-last - the AST leg chains the same list
          const chain = plan.branches.reduceRight((alternate, branch) => `${ plan.recvIdent.name } === ${
            branch.ctorPure ? injectPureImport(branch.ctorPure.entry, branch.ctorPure.hintName) : branch.ctorName
          } ? ${ injectPureImport(branch.staticPure.entry, branch.staticPure.hintName) } : ${ alternate }`, rawBranch);
          // the chain carries its own parens only where the slot cannot hold a bare conditional: a
          // CALLEE needs them, so does a sequence prefix, and so does every operator position. the
          // slots below take one bare, and the AST leg's printer prints none there
          const bareSlot = !plan.isCallee && !prefixSrc && (parent?.type === 'VariableDeclarator'
            || parent?.type === 'ReturnStatement' || parent?.type === 'Property'
            || parent?.type === 'ArrayExpression' || parent?.type === 'CallExpression'
            || (parent?.type === 'AssignmentExpression' && parent.right === memberNode));
          transforms.add(memberNode.start, memberNode.end,
            bareSlot ? `${ prefixSrc }${ chain }` : `(${ prefixSrc }${ chain })`);
          return true;
        }

        // the DESTRUCTURED spelling of the same read (`const { groupBy: g } = M`): the guard renders as
        // the declarator's value, equivalent down to the throw - on a nullish receiver the raw branch
        // dereferences it exactly as the pattern would. spelled as TWO span edits (the pattern becomes
        // the binding, the receiver identifier becomes the guard) so a prefix keeps its own claims
        // instead of being frozen inside one replacement
        function emitGuardedDestructureNarrow(meta, metaPath) {
          const prop = metaPath.node;
          const pattern = metaPath.parent;
          if (pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1 || prop.computed) return false;
          const binding = prop.value;
          if (binding?.type !== 'Identifier') return false;
          // two hosts collapse to a plain binding: a declarator, and the SOLE-ASSIGNMENT form
          // in STATEMENT position (the expression's value, natively the RHS object, is
          // unobservable there); a value-consuming assignment keeps the raw read
          const hostPath = metaPath.parentPath?.parentPath;
          const host = hostPath?.node;
          const isDeclarator = host?.type === 'VariableDeclarator' && !!host.init;
          let stmtUp = hostPath?.parentPath;
          while (stmtUp?.node && unwrapNode(stmtUp.node) !== stmtUp.node) stmtUp = stmtUp.parentPath;
          const isSoleAssignment = host?.type === 'AssignmentExpression' && host.operator === '='
            && host.left === pattern;
          const inStatement = isSoleAssignment && stmtUp?.node?.type === 'ExpressionStatement';
          if (!isDeclarator && !isSoleAssignment) return false;
          const hostInit = isDeclarator ? host.init : host.right;
          const plan = planGuardedStaticNarrow({
            memberNode: { type: 'MemberExpression', object: hostInit, property: { type: 'Identifier', name: meta.key },
              computed: false, optional: false },
            parent: null, meta, path: metaPath, resolvePure,
          });
          if (!plan || plan.bail) return false;
          const recv = plan.recvIdent.name;
          walkAstNodes({ root: pattern, visit: n => skippedNodes.add(n) });
          skippedNodes.add(plan.recvIdent);
          const chain = plan.branches.reduceRight((alternate, branch) => `${ recv } === ${
            branch.ctorPure ? injectPureImport(branch.ctorPure.entry, branch.ctorPure.hintName) : branch.ctorName
          } ? ${ injectPureImport(branch.staticPure.entry, branch.staticPure.hintName) } : ${ alternate }`,
          `${ recv }.${ meta.key }`);
          transforms.add(pattern.start, pattern.end, binding.name);
          // the chain needs its own parens only where the slot cannot hold a bare conditional; a
          // declarator INIT can, and the AST leg's printer spells it bare there
          // ... and the TAIL of a sequence init is such a slot too: the source's own comma parens
          // group it already, so the chain's would only double them (`(n++, (M === _Map ? ...))`)
          const initCore = unwrapNode(hostInit);
          const seqTail = initCore?.type === 'SequenceExpression' ? initCore.expressions.at(-1) : null;
          const bareSlot = [hostInit, ...seqTail ? [seqTail] : []]
            .some(slot => slot.start === plan.recvIdent.start && slot.end === plan.recvIdent.end);
          transforms.add(plan.recvIdent.start, plan.recvIdent.end, bareSlot ? chain : `(${ chain })`);
          // the VALUE-CONSUMING host keeps its native value - the RHS object - as a sequence
          // tail; the added parens make the wrap safe in every expression slot (a declarator
          // init would read the bare comma as its next declarator)
          if (isSoleAssignment && !inStatement) {
            transforms.insert(host.start, '(');
            transforms.insert(host.end, `, ${ recv })`);
          }
          return true;
        }

        // a SLOT-mutated global name is DEOPTED (see the slot-deopt model in the provider's
        // mutation pre-pass): the file writes the name itself, so its reads stay verbatim on
        // the live binding and the runtime serves what the user's writes left there
        const deoptNotedNames = new Set();
        function deoptMutatedSlotRead(meta) {
          if (!isDeoptedGlobalSlotRead(meta, estreeAdapter)) return false;
          if (!deoptNotedNames.has(meta.name)) {
            deoptNotedNames.add(meta.name);
            debugOutput?.warn(mutatedSlotLeftNativeWarning(meta.name));
          }
          return true;
        }

        // a non-instance rewrite whose whole span is already OWNED by a nearer queued transform
        // that does NOT re-emit the span's source verbatim (a guard memo splitting the chain, a
        // dropping consumer): the AST side stands that rewrite down entirely (`X.from?.()` keeps
        // its `_ref.from` read and `.call` this-binding off the memo), so it must decline BEFORE
        // injecting - a late compose drop strands a dead import. a verbatim container keeps the
        // needle alive, and the rewrite composes into it exactly like the standalone form
        function nonInstanceSpanOwned(node) {
          return node.type === 'MemberExpression' && transforms.ownedWithoutSlot(node.start, node.end);
        }

        function ownEmittedTextNavClaim(metaPath, ownInjector) {
          return ownEmittedNavClaim(metaPath.node, metaPath, ownOutputTests(ownInjector));
        }
        function usagePureCallback(meta, metaPath) {
          // identifiers (`<_Map/>` would call the polyfill as a React component) +
          // type-annotation positions. monkey-patched statics never reach here: detection
          // returns no meta for them and the receiver flows through the identifier machinery
          if (isDisabled(metaPath.node) || skippedNodes.has(metaPath.node)
            || metaPath.node?.type === 'JSXIdentifier'
            || isInTypeAnnotation(metaPath)) return;
          // the shadow-alias guard's kept raw read (`h === Ctor ? _X : h.of`) is already
          // ours - and so is a nav whose SE spells a minted pure call (a spent claim)
          if (metaPath.node?.type === 'MemberExpression' && ownEmittedTextNavClaim(metaPath, injector)) return;
          scopeTracker.setScope(metaPath);
          const { node } = metaPath;
          const parent = semanticParentNode(metaPath);

          if (meta.kind === 'in') return handleInExpression(meta, metaPath);

          // parent is already unwrapped past parens/chain/TS above
          if (isDeleteTarget(parent)) return;

          if (meta.guardedAliasHint && (node.type === 'Property'
            ? emitGuardedDestructureNarrow(meta, metaPath)
            : !nonInstanceSpanOwned(node) && emitGuardedStaticNarrow(meta, metaPath, parent))) return;

          let inheritedStatic = false;
          if (meta.kind === 'property') {
            if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
              return handleDestructuringPure(meta, metaPath, node);
            }
            if (node.type !== 'MemberExpression') return;
            if (memberWritePositionBails(node, parent, metaPath)) return;
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
            // provenance gate: a string-spelled key (`arr['Symbol.iterator']`) is a plain
            // property read and stays raw
            if (isSourcedSymbolIteratorMeta(meta)) return handleSymbolIterator({
              node, parent, metaPath, sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
              symbolReceiverProxyRoot: meta.symbolReceiverProxyRoot,
            });
          }

          if (deoptMutatedSlotRead(meta)) return;
          const { result: pureResult, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
          // inherited-static lookup (`this.X()` in static block of `class C extends Y`) has
          // already been retargeted to `Y`-static-meta above. when `Y` has no static `X`,
          // resolvePure misses and the global fallback fires - rewriting `this` to `_Y` would
          // silently change runtime semantics (`this` is the dynamic constructor, `_Y` is the
          // import binding). babel bails the same way; gate the fallback to keep parity
          // static-FALLBACK swap: a member that is NOT itself polyfilled but whose receiver resolves to a pure
          // ctor (`Promise.noSuchStatic` -> `_Promise.noSuchStatic`). returns true when handled (caller returns)
          function emitStaticFallbackSwap() {
            if (!(fallback && node.type === 'MemberExpression') || node.object?.type === 'Super' || inheritedStatic) return false;
            // a `prototype`-placement fallback (`globalThis.Map.prototype.has`) swaps only the CTOR sub-
            // receiver (`globalThis.Map`, possibly through proxy hops) to `_Map`, KEEPING `.prototype` ->
            // `_Map.prototype.has`; the whole receiver swap would drop `.prototype` -> the undefined `_Map.has`
            // peel transparent wrappers (parens / TS cast / non-null) so a TS-wrapped `.prototype` receiver
            // (`((c++, globalThis.self).Map.prototype as any).has`) reaches the ctor sub-receiver `X.Map`
            const protoReceiverNode = unwrapRuntimeExpr(node.object);
            const isProtoReceiver = meta.placement === 'prototype'
              && (protoReceiverNode.type === 'MemberExpression' || protoReceiverNode.type === 'OptionalMemberExpression');
            const receiverNode = isProtoReceiver ? protoReceiverNode.object : node.object;
            // a kept SE-bearing inline-call receiver already yields the polyfill binding through
            // its own rewritten return leaf - leave the member untouched, the inner visits do the job
            if (staticFallbackSwapRedundant(receiverNode, meta.sideEffects)) return true;
            skipProxyGlobal(node);
            // a fallback swap over 2+ undefinable optional hops STANDS DOWN (keeps the raw chain). resolve the
            // guard ONCE here (AFTER skipProxyGlobal - its verdict depends on that) and bail standdown BEFORE
            // the import so the kept-raw claim strands no dead ctor import. thread it - a second resolve flips it
            const fallbackGuard = !meta.protoCtorReceiverSE?.length
              ? undefinableOptionalGuard(node, ({ name }) => resolveGlobalPolyfill(name),
                { scope: metaPath?.scope, adapter: estreeAdapter, path: metaPath })
              : { kind: 'erase' };
            if (fallbackGuard.kind === 'standdown') {
              collapseStandownRoot({ node, metaPath, adapter: estreeAdapter, transforms, injectPureImport, resolveGlobalPolyfill });
              return true;
            }
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
              binding, node, metaPath, sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount, receiverNode,
              protoCtorReceiverSE: meta.protoCtorReceiverSE, protoCtorChainAssignAt: meta.protoCtorChainAssignAt ?? null,
              chainAssignInsertAt: meta.chainAssignInsertAt ?? null, fallbackGuard,
            });
            // outer text-emit absorbs the whole receiver: any inner Identifier whose name
            // matches the polyfill's substitution would compose into the emit (`_Map` substring
            // inside the outer's `_Map` -> `__Map`). peel through wrappers + IIFE shells to find
            // the effective receiver leaf and mark it skipped before the Identifier visitor runs;
            // a leaf preserved by a re-emitted sideEffect subtree keeps its own substitution
            skipUnpreservedReceiverLeaf(receiverNode, meta.sideEffects);
            return true;
          }
          if (emitStaticFallbackSwap()) return;
          // the inherited-static-resolves-to-instance bail (`super.X` / `this.X` in static ctx where
          // X has no static on the super class) lives in the provider's `resolveUsage`, the entry BOTH
          // flavors go through, so `pureResult` is already null for that shape
          // and the `if (!pureResult) return;` above caught it - the fallback never fires (gated on
          // `!inheritedStatic`)
          if (!pureResult) {
            tryCollapseAliasProxyHop(node, metaPath);
            return;
          }
          const { entry: importEntry, kind, hintName } = pureResult;

          // a member of a raw rebound/reused receiver tail: every non-instance rewrite is
          // suppressed (the tail re-emits its source verbatim), while an instance dispatch
          // proceeds and composes into the rebound tail via the outer guard's needle rebuild.
          // gated BEFORE any import injection so a suppressed rewrite strands no dead import.
          // the span-ownership probe covers the `?.()`-SPELLED statics the marking walk cannot
          // reach (a callee chain under an optional METHOD call - the owner's memo keeps the
          // `_ref.from` read and its `.call` this-binding); a PLAIN-spelled claim in an owned
          // span stays live and composes (babel replaces the memo-read with the claim there)
          if (kind !== 'instance' && (rebindTailMembers.has(node)
            || (parent?.optional === true && parent.callee === node && nonInstanceSpanOwned(node)))) return;

          // a static claim whose receiver navigates 2+ undefinable optional hops STANDS DOWN (keeps the raw
          // chain - no single test expresses the union). resolve the guard ONCE (a second resolve is not
          // idempotent) and thread the verdict to the emitter
          const staticEraseGuard = node.type === 'MemberExpression' && kind !== 'instance'
            ? undefinableOptionalGuard(node, ({ name }) => resolveGlobalPolyfill(name),
              { scope: metaPath?.scope, adapter: estreeAdapter, path: metaPath })
            : null;
          // a single-hop 'guard' verdict whose SE channels (computed-key / receiver effects) the guard
          // alternate can't re-emit bails the STANDALONE claim (`replaceGlobalOrStatic` returns raw there).
          // when NO outer guard owns the root, the static swallows nothing, so its proxy-hop root must stay
          // LIVE for its own global usage to collapse + deopt the chain (`globalThis.window?.Array[(c++, 'of')]`
          // -> `_globalThis.Array[c++, 'of']`, babel's shape); suppressing it below would strand a raw
          // `globalThis` (ie:11 ReferenceError). still INJECT the pure import - babel injects it on detection
          // and leaves it dead after the collapse, so the import set matches. an OUTER-guarded root instead
          // falls through: the emitter emits the static BARE into the owning guard's body (the guard owns the
          // nullability), so it must NOT bail here
          if (staticEraseGuard?.kind === 'guard' && (meta.sideEffects?.length || meta.receiverEffectCount)
            && !outerGuardOwnedRoot(node, transforms)
            && migratableClaimSe({
              sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
              rootNode: staticEraseGuard.object, end: node.end,
            }) === null) {
            injectPureImport(importEntry, hintName);
            return;
          }

          // proxy-global suppression is dispatch-conditional. instance dispatch leaves the
          // receiver Identifier live so its substitution composes into the outer guard's
          // rootRaw slot (`_globalThis.foo` instead of `globalThis?.foo` in the memo'd guard).
          // static dispatch already swallows the receiver in its own emit, so suppress the
          // parallel identifier transform (its needle wouldn't compose anyway and the
          // injected import would strand as a dead line - single-pass runs carry no
          // reference tracking to filter it)
          if (node.type === 'MemberExpression' && kind !== 'instance') skipProxyGlobal(node);

          // bail standdown BEFORE the import so the kept-raw claim strands no dead pure import
          if (staticEraseGuard?.kind === 'standdown') {
            collapseStandownRoot({ node, metaPath, adapter: estreeAdapter, transforms, injectPureImport, resolveGlobalPolyfill });
            return;
          }

          // a proxy-global root navigating a NON-pure leaf through redundant hops collapses the prefix
          // (`globalThis.self.Array` -> `_globalThis.Array`); the bare identifier rewrite is skipped.
          // checked BEFORE the import injection: the collapse emits its own binding(s), so an eager
          // root import here would strand a dead line the collapse never references (babel emits none)
          // a member-shaped global meta (`globalThis.self` resolving as the global `self`) anchors the
          // hop-collapse drive too - the AST emitter's trigger never gated on the node SHAPE, and gating
          // here left an assign-stored navigation (`(k = globalThis.self)?.self.X`) with its raw hop
          if (kind === 'global'
            && (node.type === 'Identifier' || node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
            && collapseProxyHopRoot(metaPath)) return;
          // the OTHER half of that pair, the one the AST emitter runs at its own twin of this site: a
          // nav the collapse refuses because its VALUE short-circuits still needs its guard SPELLED,
          // or the bare swap below drops the `?.` along with the hops - `delete (globalThis.window
          // .self?.WeakSet)` then deleted the realm's slot on the branch the source short-circuits
          // past. gated on a DELETE consumer: there no claim above can own the connector, while a
          // READ consumer's claim channel owns the span and is visited after this meta. the meta of a
          // deleted member resolves at the chain ROOT, so an Identifier meta climbs to the member
          // that reads off it - the render's own anchor
          const navAnchor = kind === 'global' && node.type === 'Identifier'
            && (metaPath.parentPath?.node?.type === 'MemberExpression'
              || metaPath.parentPath?.node?.type === 'OptionalMemberExpression')
            && metaPath.parentPath.node.object === node ? metaPath.parentPath : metaPath;
          if (kind === 'global'
            && (navAnchor.node.type === 'MemberExpression' || navAnchor.node.type === 'OptionalMemberExpression')
            && renderKeptNavValue(navAnchor, { onlyDeleteConsumer: true })) return;
          // the one shape no channel above reaches: a delete over a SEQUENCE-rooted nav whose tail is
          // an instance dispatch. the anchor climb past the sequence lives with the channel itself
          if (kind === 'global' && collapseDeleteTargetNav(navAnchor)) return;
          // a plain nav on a proven-call root: the hop channels decline it, and the doctrine says a
          // navigation with nothing to short-circuit collapses onto the ROOT ponyfill
          if (kind === 'global' && collapsePlainCallRootedNav(navAnchor)) return;
          const binding = injectPureImport(importEntry, hintName);

          if (kind === 'instance' && node.type === 'MemberExpression') {
            replaceInstance({
              binding, node, parent, metaPath, sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
            });
            // an alias-rooted receiver keeps its identifier, so the instance claim re-emits it
            // verbatim and NO usage callback ever reaches the alias root (a method-EXTRACT chain
            // has no unresolved sibling meta to fire the fallback below) - the redundant `.self`
            // hop would survive to an off-engine throw. collapse it here; the drive composes into
            // the claim as a nested transform and self-gates on non-alias / hop-free receivers
            tryCollapseAliasProxyHop(node, metaPath);
          } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
            replaceGlobalOrStatic({
              binding, node, parent, metaPath, inheritedStatic,
              sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
              chainAssignInsertAt: meta.chainAssignInsertAt, staticEraseGuard,
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
        }

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
        function skipFullConsumeDeadInit(init, isForInit, declScope, declPath) {
          // the init NODE ITSELF is dead only when nothing of it reaches the output. an SE-bearing
          // init is LIFTED VERBATIM as a standalone statement, so its own claim must stay live -
          // suppressing it kills the whole-ctor member rewrite while the proxy-global root UNDER it
          // stays visitable, and the lift then polyfills that root instead of the ctor
          // (`_globalThis[(e++, 'Map')]` where babel's re-traversal of the same lift reads
          // `e++, _Map`). a sequence init is never a claim host itself, so this only widens the
          // bare-expression case; the per-operand and dead-tail walks below still skip what IS dropped
          if (!mayHaveSideEffects(init)) skippedNodes.add(init);
          const { prefix, tail } = peelNestedSequenceExpressions(init);
          // a fully-discarded proxy-nav receiver whose COMPLETE harvest captures every effect: walk-skip the
          // WHOLE init except those SE subtrees, so no per-hop collapse (`.self` -> `_globalThis`) queues a
          // transform the discard lift then orphans in the compose. an EMPTY harvest on a side-effecting init
          // means it can't be fully accounted for -> fall through to KEEP it, so no effect is lost. gated on
          // the harvest of the WHOLE init (identical to the collapse-defer + discard lift), so all stay consistent
          const navSe = tail && declPath && shouldDropRescueReceiver(tail)
            ? harvestDiscardedReceiverSE(init, { scope: declScope, adapter: estreeAdapter, path: declPath }) : [];
          if (navSe.length) {
            const keep = new Set();
            for (const se of navSe) walkAstNodes({ root: se, visit: n => keep.add(n) });
            walkAstNodes({ root: init, visit: n => { if (!keep.has(n)) skippedNodes.add(n); } });
            return;
          }
          // the same rule one level down: a sequence prefix can sit UNDER the member spine
          // (`({ p: Promise }, globalThis).self.Array`), where the top-level peel never reaches it.
          // the collapse drops an effect-free operand there exactly like a top-level one, and its
          // dead payload otherwise keeps a rewrite with no slot left to compose into
          for (let hop = tail; hop?.object; hop = unwrapRuntimeExpr(hop.object)) {
            for (const buried of peelNestedSequenceExpressions(unwrapRuntimeExpr(hop.object)).prefix) {
              if (!mayHaveSideEffects(buried)) walkAstNodes({ root: buried, visit: n => skippedNodes.add(n) });
            }
          }
          for (const operand of prefix) {
            if (!mayHaveSideEffects(operand)) walkAstNodes({ root: operand, visit: n => skippedNodes.add(n) });
            // a kept SE operand is re-emitted verbatim (statement lift, or a for-init sink's
            // re-embedded slot): record it so a proxy-hop host buried inside re-anchors as a
            // nested compose on its later visit - matching babel's drain re-traversal of the
            // lifted statement and its in-place rebuild of the for-init sink host
            else markLiftedSePrefixOperand(operand);
          }
          if (!isForInit && tail !== init && !mayHaveSideEffects(tail)) {
            walkAstNodes({ root: tail, visit: n => skippedNodes.add(n) });
          }
        }

        const usageVisitors = mergeVisitors({
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          VariableDeclaration(path) {
            const isForInit = isForInitDeclaration(path.parentPath?.node, path.node);
            for (const d of path.node.declarations) {
              if (d.init && canFullyConsumeProxyDeclarator(d, path.scope, path)) {
                skipFullConsumeDeadInit(d.init, isForInit, path.scope, path);
              }
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
              skipFullConsumeDeadInit(node.right, false, path.scope, path);
            }
            tryFlattenProxyHopHost(path);
          },
        }, createUsageVisitors({
          adapter: estreeAdapter,
          onUsage: usagePureCallback,
          method,
          suppressProxyGlobals: true,
          walkAnnotations: false,
          isEntryAvailable: isEntryNeeded,
          resolveMeta: resolvePure,
          resolvePure,
          // the hop collapse owns every chain it can take; the navs it refuses - the
          // short-circuiting probe - fall to the kept-nav render, exactly as in the AST emitter.
          // a hop inside a kept chain-assign VALUE (the marking walk dug into it - the value
          // carries an unresolvable hop) skips the hop FOLD outright: folding would swallow the
          // read below into what the assignment stores. the kept-nav render still runs - it spells
          // the claimless canon in place - and stands down on three things it cannot own: a span an
          // owning claim already replaced, a receiver another channel marked REPLACED (a synth
          // literal supplants it, and its registration happens before this nav is visited), and an
          // opt-out directive
          onSuppressedProxyHop: metaPath => {
            // an opt-out is an opt-out whatever the edit is FOR - the same rule the optional-call
            // type-argument pass above spells. all three channels below INJECT (a ponyfilled root
            // and leaf), so none of them is the reprint compensation that has to run regardless;
            // the whole-file directive bails earlier, a line-scoped one only reaches here
            if (isDisabled(metaPath.node)) return;
            // a DECLINED stored render is not an answer: it means this write has no collapse of its
            // own, and the nav below it still needs one. falling out here left the hops raw whenever
            // the nav sat on an assignment's right side (`v = (w = globalThis).window.self.X`) - the
            // same source collapses in every other consumer, and on the AST leg in this one too
            const stored = storedUserAssignmentOf(metaPath);
            if (stored && collapseStoredKeptAssign(stored, metaPath)) return;
            // a PATTERN target belongs to the destructure pipeline whatever the stored render decided:
            // its claims live in the pattern, so a hop collapse queued below would land inside a span
            // that render replaces wholesale (the queue reports it as a missing inner needle)
            if (stored?.left?.type === 'ObjectPattern' || stored?.left?.type === 'ArrayPattern') return;
            if (!collapseProxyHopRoot(metaPath)) renderKeptNavValue(metaPath);
          },
          // the stored canon from the nav's proxy-global ROOT visit (shared core tail): the
          // one channel that still fires when no claim owns the value's hops - a DECLINED
          // leaf claim (`(kv = nav)?.BigInt`, no BigInt pure) marks them handled without a
          // render, and a rideless assignment (`kv = nav;`) never enters the member channel.
          // a false return keeps the natural root rewrite (the render already spelled and
          // claimed the span on true - the identifier rewrite inside would collide).
          // gated like the marking dig: only an UNRESOLVABLE-hop value takes the stored
          // render (a resolvable value keeps its natural claims), and a PATTERN target
          // belongs to the destructure pipeline - claiming it here races that render
          suppressKeptNavRoot: metaPath => {
            const stored = storedUserAssignmentOf(metaPath);
            if (!stored || stored.left?.type === 'ObjectPattern' || stored.left?.type === 'ArrayPattern') return false;
            if (!navHasUnresolvableProxyHop(peelChainRootValue(stored), spec => resolvePure(spec, metaPath))) return false;
            return collapseStoredKeptAssign(stored, metaPath);
          },
        }));
        traverse(ast, trackReferences ? mergeVisitors(usageVisitors, {
          // a NON-REFERENCE occurrence (object-literal key, member key, label, import/export name)
          // is not a live use of a pure-import binding: tracking it would keep a DEAD `_Hint$method`
          // import alive when a user source-name coincides with it (babel's dead-import filter reads
          // `binding.references`, which excludes these). mirror that so post-pass pruning matches
          Identifier(path) {
            if (!isNonReferencePosition(path.parent, path.node)) injector.trackReferencedName(path.node.name);
          },
        }) : usageVisitors);
        applySynthSwaps();
        applyDestructuringTransforms();
        scopeTracker.drainInto(transforms);
        transforms.apply(refCanonEligible ? (splices, inserts) => canonicalizeRefNumbering({ splices, inserts, injector }) : null);
        return finalize();
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
