import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  SINGLE_STATEMENT_SLOTS,
  markCapturedKeyedPattern,
  allProxySelectingInit,
  assignmentValueDiscarded,
  discardedSequenceElement,
  computedKeyHasSideEffects,
  foldedPropertyKeyName,
  followConstLiteralAlias,
  forEachStatementPosition,
  getMinifierSequenceExpressions,
  isPristineProxyGlobal,
  isQuietLiteralOperand,
  isPropertyNode,
  isRestProperty,
  installedWriteValue,
  mayHaveSideEffects,
  propBindingIdentifier,
  observableSequenceElements,
  ownRelocatedHeadElement,
  patternSlotTarget,
  positionalElements,
  resolveCallArgument,
  patternFullyConsumed,
  peelNestedSequenceExpressions,
  peelTransparentExpr,
  peelToExpressionStatement,
  unwrapRuntimeExpr,
  valueMayBeNullish,
  POSSIBLE_GLOBAL_OBJECTS,
} from './helpers/ast-patterns.js';
import {
  assignmentExpression,
  callExpression,
  cloneNode,
  conditionalExpression,
  expressionStatement,
  identifier,
  literal as valueLiteral,
  memberExpression,
  objectPattern,
  objectProperty,
  nullFirstGuardTest,
  renderCtorIdentityNarrow,
  renderInstanceDefaultGuard,
  renderKeyedDestructureRead,
  sequenceExpression,
  variableDeclarator,
} from './render.js';
import {
  agreeingTernaryArm,
  globalProxyMemberName,
  isStaticPlacement,
  memberTargetTakesExtraction,
  resolveKey,
  proxyGlobalRootName,
  resolveObjectName,
  symbolSourcedFoldedKey,
} from './detect-usage/resolve.js';
import { toHint } from './resolve-node-type/base.js';
import {
  discardRescueNodesWithReads,
  isReReadableSurfaceNav,
  destructurePropLeafMeta,
  isReReferenceableReceiver,
  residualInitRunsEffects,
  staticContainerReceiverName,
} from './detect-usage/destructure.js';
import { hasConstructorEntry, resolve as resolveBuiltIn } from './index.js';

// shape classification for destructure hosts (VariableDeclaration / AssignmentExpression
// inside ExpressionStatement): the parser-agnostic booleans both plugins consume -
// `isExport` / `isForInit` / `isBodyless` / `isMultiDecl` - and the plan of the one host
// rewrite both plugins owe ahead of detection, the minifier-sequence split. everything here
// operates on raw AST nodes, so callers pass nodes from either babel paths or estree-toolkit
// paths; the surgery that lands a plan in the host tree is each binding's own

// is `host` the single-statement slot of `parent`? composed on the canonical slot table, which
// already carries the two-slot IfStatement (`consequent` / `alternate`); the concise-body arrow is
// the one host outside it (its slot holds an EXPRESSION, so the statement table has no entry).
// NOTE the answer is "this IS the slot", NOT "this slot needs braces": a BRACED body occupies the
// same slot and answers true - callers that emit multiple statements must test the host's own type.
// callers pass raw nodes - works uniformly across babel paths and estree-toolkit paths
export function isBodylessStatementSlot(parent, host) {
  if (!parent) return false;
  if (parent.type === 'ArrowFunctionExpression') return parent.body === host;
  return (SINGLE_STATEMENT_SLOTS.get(parent.type) ?? []).some(slot => parent[slot] === host);
}

// iteration statements: `continue <label>` can target a label on one of these, and value flow has
// a back-edge here. `t.isLoop` is a babel-types alias the hand-written estree adapter doesn't
// expose, so this shared classifier owns the predicate - imported by the resolver's flow analysis
// (class-fields / narrow-by-guards / discriminant-narrow) and the unplugin scope tracker
const LOOP_STATEMENT_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);

export function isLoopStatement(node) {
  return LOOP_STATEMENT_TYPES.has(node?.type);
}

// peel a chain of stacked LabeledStatements (`a: b: c: <stmt>`) down to the innermost labeled
// body. both parsers nest LabeledStatement.body, so this is parser-agnostic. used to decide
// whether a labeled body slot ultimately hosts a loop: a single-level `isLoopStatement(prev)`
// check misses `a: b: for(...)` because `prev` is the inner LabeledStatement, not the loop
export function peelLabeledStatements(node) {
  let cur = node;
  while (cur?.type === 'LabeledStatement') cur = cur.body;
  return cur;
}

// is `declaration` the init slot of a `for` head? single-sourced so the emitters cannot grow a
// weaker spelling: testing only the parent TYPE would take a for-BODY declaration for a for-init one
export function isForInitDeclaration(declarationParent, declaration) {
  return declarationParent?.type === 'ForStatement' && declarationParent.init === declaration;
}

// classify a VariableDeclaration host's enclosing context. returns the parser-agnostic
// booleans the plugin's strategy planner consumes:
//   isExport     - declaration is wrapped in `export` (`ExportNamedDeclaration`)
//   isForInit    - declaration is the init slot of a `for` loop
//   isBodyless   - declaration sits in an unbraced body slot (if/while/...) -
//                  block-wrapping needed when emitting multiple statements
//   isMultiDecl  - declaration has multiple declarators (`let a, b, c`)
// the three shapes are mutually exclusive by construction: an `ExportNamedDeclaration` parent is not
// a statement-slot host at all, and a for-INIT slot is not the for's `body` slot - so `isBodyless`
// needs no gate on the other two
export function classifyVariableDeclarationHost({ declaration, declarationParent }) {
  return {
    isExport: declarationParent?.type === 'ExportNamedDeclaration',
    isForInit: isForInitDeclaration(declarationParent, declaration),
    isBodyless: isBodylessStatementSlot(declarationParent, declaration),
    isMultiDecl: declaration.declarations.length > 1,
  };
}

// A loop-head extraction cannot re-read an element after its neighbours have evaluated: they may
// replace its binding. A later pattern also reads in source order, after the earlier extraction.
// Capture the positions once, then let each element's own declarations consume its captured value.
// Rest positions and opaque spreads keep their original route. A forced capture can
// retain a literal spread whose expanded positions are statically known.
export function planArrayWrapperCapture({
  pattern, init, force = false, restPattern = null, adapter = null, injectorState = null, nestedOnly = false,
}) {
  if (restPattern && restPattern.properties?.at(-1)?.type !== 'RestElement'
    && !restPattern.properties?.some(computedKeyHasSideEffects)) return null;
  const array = peelTransparentExpr(init);
  if (pattern?.type !== 'ArrayPattern' || !init || (!force && array?.type !== 'ArrayExpression')) return null;
  // The declaration fallback captures the positions of a literal wrapper whose element carries an
  // opaque NESTED claim (a call, a member, a selection - anything but an object literal, which keeps
  // its slot pairing and carried initializer) before a sibling can stage an extraction. The whole
  // literal is captured, so every element reads once, in source order, ahead of the per-element
  // patterns - a sibling beside the claim rides the same capture (`[{ y: { at } }, tail] = [mk(),
  // eff()]`), and a wrapper nested one level deeper descends to its own element.
  if (nestedOnly && !wrapperCarriesOpaqueNestedClaim(pattern, array)) return null;
  const elements = [];
  function collectCaptureElements(level, value, path = []) {
    const literal = peelTransparentExpr(value);
    if ((!force && literal?.type !== 'ArrayExpression')
      || level.elements.some(element => element?.type === 'RestElement')
      || (literal?.elements?.some(element => element?.type === 'SpreadElement')
        && (!force || !positionalElements(literal.elements)))) return false;
    return level.elements.every((element, index) => {
      if (!element) return true;
      const position = [...path, index];
      const source = literal?.type === 'ArrayExpression' ? resolveCallArgument(literal.elements, index) : null;
      if (element.type === 'ArrayPattern') return collectCaptureElements(element, source, position);
      if (element.type === 'AssignmentPattern') return false;
      // Realm rest patterns already have a receiver mirror that keeps their static siblings.
      if (element === restPattern && source && adapter && allProxySelectingInit(source, { adapter, injectorState })) return false;
      elements.push({ pattern: element, index: position[0], path: position });
      return true;
    });
  }
  if (!collectCaptureElements(pattern, array)) return null;
  // ... an effect-free sole element needs no capture of its own - unless it is the opaque nested
  // claim the fallback exists for: a member element (`[h.g]`) is a getter a re-read would fire twice
  if (!elements.length || (!force && !nestedOnly && array.elements.every(element => !mayHaveSideEffects(element))
    && elements.length === 1)) return null;
  return { pattern, init, elements };
}

// does a literal wrapper hold, at some element, a nested keyed pattern over an OPAQUE value - the
// shape the declaration fallback captures? the pattern and the literal pair position for position
// (a spread shifts them, a default re-reads a missing slot), a nested wrapper descends to its own
// element, and the claim's slot is a value the source COMPUTES - a call, a member (a getter a
// re-read would fire twice), a selection, a kept write. a bare name re-reads for free and keeps its own routes
// (`[rec]`, `[globalThis]` - the user-key twin off the global object must stay native), and an
// object literal pairs by key already
function wrapperCarriesOpaqueNestedClaim(pattern, array) {
  if (array?.type !== 'ArrayExpression' || pattern.elements.length !== array.elements.length
    || array.elements.some(element => element?.type === 'SpreadElement')
    || pattern.elements.some(element => element?.type === 'AssignmentPattern' || element?.type === 'RestElement')) return false;
  return pattern.elements.some((element, index) => {
    const source = array.elements[index];
    if (!element || !source) return false;
    if (element.type === 'ArrayPattern') return wrapperCarriesOpaqueNestedClaim(element, peelTransparentExpr(source));
    const value = peelTransparentExpr(peelNestedSequenceExpressions(peelTransparentExpr(source)).tail);
    const opaque = value?.type === 'CallExpression' || value?.type === 'OptionalCallExpression'
      || value?.type === 'MemberExpression' || value?.type === 'OptionalMemberExpression'
      || value?.type === 'ConditionalExpression' || value?.type === 'LogicalExpression' || value?.type === 'AssignmentExpression';
    return opaque && element.type === 'ObjectPattern'
      && planNestedKeyedPatternCapture({ pattern: element, init: source, force: true })?.leafPattern.properties.length === 1;
  });
}

// The capture and the per-element declarations share one reference per consumed position. `embed`
// is the binding's source-node boundary; the patterns move rather than being interpreted here.
export function renderArrayWrapperCapture(plan, { mintRef, embed = node => node }) {
  const refs = new Map();
  const elements = plan.elements.map(element => {
    const ref = mintRef();
    refs.set(element.pattern, ref);
    return {
      ...element,
      ref,
      declarator: variableDeclarator(embed(element.pattern), identifier(ref)),
    };
  });
  function capturePattern(pattern) {
    if (!pattern) return null;
    const ref = refs.get(pattern);
    return ref ? identifier(ref) : { ...pattern, elements: pattern.elements.map(capturePattern) };
  }
  return {
    capture: variableDeclarator(embed(capturePattern(plan.pattern)), embed(plan.init)),
    elements,
  };
}

// Split an object-pattern hop chain at its innermost binding when a computed key must stay
// between the outer reads and the leaf dispatch, or a guarded read needs the receiver's identity.
// A guard can supply its ancestor path to retain ordinary siblings at each outer level.
// The source outer pattern keeps its coercions,
// keys and getters; only the inner pattern moves onto the captured value. `allowArray`
// lets a retained capture delegate an array level to the positional capture planner.
export function planNestedKeyedPatternCapture({ pattern, init, force = false, ancestors: sourceAncestors = null, allowArray = false }) {
  if (!init) return null;
  const ancestors = [];
  let inner = pattern;
  if (force && sourceAncestors?.length) {
    for (const level of sourceAncestors) {
      if (level.pattern.properties.some(prop => prop.type === 'RestElement')) return null;
      ancestors.push(level);
      inner = level.prop.value;
    }
  }
  while (inner?.type === 'ObjectPattern') {
    if (force && inner.properties.length !== 1) break;
    if (inner.properties.some(prop => prop.type === 'RestElement')) break;
    const nested = inner.properties.filter(prop => {
      const value = !force && prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      return value?.type === 'ObjectPattern' || (allowArray && value?.type === 'ArrayPattern');
    });
    if (nested.length !== 1) break;
    const [prop] = nested;
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null;
    const defaultValue = !force && prop.value?.type === 'AssignmentPattern' ? prop.value : null;
    const value = defaultValue ? defaultValue.left : prop.value;
    if (value?.type !== 'ObjectPattern' && !(allowArray && value?.type === 'ArrayPattern')) break;
    ancestors.push({ pattern: inner, prop, defaultValue });
    inner = value;
  }
  if (allowArray && inner?.type === 'ArrayPattern' && ancestors.length) {
    return { pattern, init, ancestors, leafPattern: inner, leaf: null, rest: false, keys: [] };
  }
  const leaf = inner?.properties?.[0];
  const rest = !force && inner?.properties?.at(-1)?.type === 'RestElement';
  if (!ancestors.length || inner?.type !== 'ObjectPattern' || !inner.properties.length
    || (leaf?.type !== 'Property' && leaf?.type !== 'ObjectProperty') || patternSlotTarget(leaf.value)?.type !== 'Identifier'
    || (force && inner.properties.some(prop => (prop.type !== 'Property' && prop.type !== 'ObjectProperty')
      || prop.computed || prop.value?.type !== 'Identifier'))
    || (!force && !rest && [...ancestors.map(level => level.prop), leaf].every(prop => !computedKeyHasSideEffects(prop)))) return null;
  return { pattern, init, ancestors, leafPattern: inner, leaf, rest, keys: computedKeyHasSideEffects(leaf) ? [leaf.key] : [] };
}

// the CONSTRUCTOR a keyed capture reads off the PRISTINE realm, as its pure binding, or null.
// Capturing `{ Promise: _ref } = _globalThis` binds whatever the realm holds, which on an engine
// without that constructor is nothing at all - and a guard over that ref then turns the missing
// native into a throw where the constructor's own ponyfill would have answered. Asked of a
// SINGLE-key capture only, because a deeper one keeps its own per-level receivers. The KEY half is
// the surface-read canon's: a proxy-global name is a HOP rather than a claim, and a MUTATED slot
// keeps the user's replacement, which is the value the read owes
export function capturedRealmCtorPure({ capture, scope, adapter, path, resolveGlobalPolyfill }) {
  if (!capture || capture.ancestors.length !== 1 || !resolveGlobalPolyfill) return null;
  const [level] = capture.ancestors;
  if (level.prop.computed || level.defaultValue) return null;
  const key = foldedPropertyKeyName(level.prop);
  const init = unwrapRuntimeExpr(installedWriteValue(capture.init));
  if (key === null || POSSIBLE_GLOBAL_OBJECTS.has(key) || init?.type !== 'Identifier') return null;
  if (capture.rest && !hasConstructorEntry(key)) return null;
  // the alias canon names the receiver: a direct proxy global, a plugin-managed alias, or a binding
  // whose init peels to one (`const g = globalThis`) - and a shadowed name answers null there
  const realm = proxyGlobalRootName({ node: init, scope, adapter, path });
  if (!realm || !isPristineProxyGlobal(adapter, realm)) return null;
  return adapter.isMutatedStatic?.(realm, key) ? null : resolveGlobalPolyfill(key);
}

// Capture the innermost pattern while retaining native outer keys and defaults.
// `anchorPure` supplies a proven pristine realm constructor, including its whole index for rest.
// Assignment renders can delegate the moved leaf to `renderLeaf` and preserve the RHS value.
export function renderNestedKeyedPatternCapture(plan, {
  mintRef,
  embed = node => node,
  narrow = null,
  split = null,
  injectImport = null,
  assignment = false,
  preserveResult = false,
  anchorPure = null,
  renderLeaf = null,
}) {
  markCapturedKeyedPattern(plan.leafPattern);
  const ref = mintRef();
  let captured = identifier(ref);
  for (const level of plan.ancestors.toReversed()) {
    captured = { ...level.pattern, properties: [{ ...level.prop,
      value: level.defaultValue ? { ...level.defaultValue, left: captured } : captured }] };
  }
  const elements = (narrow ? plan.leafPattern.properties : [plan.leaf]).map((leaf, index) => {
    const value = narrow ? renderCtorIdentityNarrow(split?.[index].plan ?? narrow,
      memberExpression(identifier(ref), identifier(leaf.key.name ?? leaf.key.value)), {
        injectImport, spellRecv: () => identifier(ref),
      }) : identifier(ref);
    return { pattern: plan.leafPattern, ref,
      guarded: !!narrow,
      declarator: variableDeclarator(embed(narrow ? leaf.value : plan.leafPattern), value) };
  });
  const splitCapture = plan.ancestors.some(level => level.pattern.properties.length > 1 || computedKeyHasSideEffects(level.prop));
  if (splitCapture) {
    let receiver = ref;
    for (const level of plan.ancestors.toReversed()) {
      const outer = mintRef();
      const ordered = [];
      for (const prop of level.pattern.properties) {
        const source = prop === level.prop ? { ...prop, value: level.defaultValue
          ? { ...level.defaultValue, left: identifier(receiver) } : identifier(receiver) } : prop;
        // A later destructuring lowering may evaluate the key before rejecting null.
        // Keep that rejection in the initializer, ahead of the source pattern's key.
        const init = computedKeyHasSideEffects(prop) ? conditionalExpression(nullFirstGuardTest(identifier(outer)),
          memberExpression(identifier(outer), valueLiteral(''), { computed: true }), identifier(outer)) : identifier(outer);
        ordered.push({ declarator: variableDeclarator(embed({ ...level.pattern, properties: [source] }), init) });
        if (prop === level.prop) ordered.push(...elements);
      }
      elements.splice(0, elements.length, ...ordered);
      receiver = outer;
    }
    captured = identifier(receiver);
  }
  // the ctor binding replaces BOTH halves: the pattern collapses to the ref and the init to the import
  const anchorNode = anchorPure && !splitCapture && plan.ancestors.length === 1 && injectImport
    ? identifier(injectImport(anchorPure.entry, anchorPure.hintName)) : null;
  if (anchorNode) captured = identifier(ref);
  if (assignment) {
    if (plan.rest && anchorNode && preserveResult) {
      const result = identifier(ref);
      return { elements, expression: sequenceExpression([
        assignmentExpression('=', result, embed(plan.init)),
        renderLeaf ? renderLeaf(anchorNode) : assignmentExpression('=', embed(plan.leafPattern), anchorNode), result,
      ]) };
    }
    const capture = assignmentExpression('=', embed(captured), anchorNode ?? embed(plan.init));
    const result = preserveResult ? splitCapture ? captured : identifier(mintRef()) : null;
    return { elements, expression: sequenceExpression([
      result && !splitCapture ? assignmentExpression('=', result, capture) : capture,
      ...elements.map(({ declarator, pattern: elementPattern }) => renderLeaf && elementPattern === plan.leafPattern
        ? renderLeaf(identifier(ref)) : assignmentExpression('=', declarator.id, declarator.init)),
      ...result ? [result] : [],
    ]) };
  }
  return {
    capture: variableDeclarator(embed(captured), anchorNode ?? embed(plan.init)),
    elements,
  };
}

// does a destructure key RUN code where it stands: a member target's setter, a nested pattern's reads,
// a default or a computed key that runs? a plain binding write only ever observes
function destructureKeyRunsCode(item) {
  if (!isPropertyNode(item)) return true;
  if (computedKeyHasSideEffects(item)) return true;
  if (item.value?.type === 'AssignmentPattern' && mayHaveSideEffects(item.value.right)) return true;
  return patternSlotTarget(item.value)?.type !== 'Identifier';
}

// An effectful key cannot keep a sentinel: that reads its getter twice. Split the level
// into native single-property patterns. Rest only admits pristine static-only captures.
// Nested patterns remain native operands, so their iterator/default effects keep their position.
// A mixed static/instance claim uses the supplied identity planner over the captured receiver.
// eslint-disable-next-line max-statements -- ordered capture admission across flat, nested and array hosts
export function planRetainedObjectCapture({
  pattern,
  init,
  assignment = false,
  prop = null,
  hostPath = null,
  adapter = null,
  resolveNodeType = null,
  injectorState = null,
  kind = 'instance',
  entry = null,
  patternPath = null,
  probedInit = false,
  resolvePure = null,
  resolveStaticProp = null,
  planGuardedNarrow = null,
  resolveStaticKey = null,
  parameterCallSites = null,
  isClaimedProp = null,
  isConsumedProp = null,
  meta: resolvedMeta = null,
  provenCtorName = null,
}) {
  if (prop && isClaimedProp?.(prop)) return null;
  const guarded = !!resolvedMeta?.guardedAliasHint && kind === 'instance';
  if (guarded && pattern?.type === 'ObjectPattern' && !pattern.properties.includes(prop)) {
    const capture = planNestedKeyedPatternCapture({ pattern, init, allowArray: true })
      ?? planNestedKeyedPatternCapture({ pattern, init, force: true, allowArray: true });
    if (capture && (capture.leafPattern.type === 'ArrayPattern' || capture.leafPattern.properties.includes(prop))) {
      const innerPlan = planRetainedObjectCapture({ pattern: capture.leafPattern, init, assignment, prop,
        hostPath, adapter, resolveNodeType, injectorState, kind, entry, patternPath,
        probedInit, resolvePure, resolveStaticProp, planGuardedNarrow, isClaimedProp, isConsumedProp, meta: resolvedMeta });
      if (innerPlan) return { capture, innerPlan, assignment };
    }
  }
  const arrayReceiver = ownRelocatedHeadElement(hostPath) ?? installedWriteValue(init);
  const arraySource = followConstLiteralAlias(arrayReceiver, { scope: hostPath?.scope, adapter, path: hostPath });
  const keyedElement = computedKeyHasSideEffects(prop);
  if (pattern?.type === 'ArrayPattern' && (guarded || keyedElement || pattern.elements.length === 1)
    && (guarded || arraySource?.type === 'ArrayExpression' && arraySource.elements.length >= 1)) {
    const capture = planArrayWrapperCapture({ pattern, init: arraySource ?? arrayReceiver, force: true });
    const element = guarded || keyedElement ? capture?.elements.find(({ pattern: candidate }) => candidate.type === 'ObjectPattern'
      && (candidate.properties.includes(prop)
        || planNestedKeyedPatternCapture({ pattern: candidate, init, force: true })?.leafPattern.properties.includes(prop)))
      : capture?.elements[0];
    const elementPattern = element?.pattern;
    // Keep alias resolution at the read site: the source's literal can belong to an
    // outer scope, and its slots may have been written since its declaration.
    const source = element?.path.reduce((node, index) => arraySource === arrayReceiver && arraySource?.type === 'ArrayExpression'
      ? resolveCallArgument(peelTransparentExpr(node)?.elements ?? [], index)
      : memberExpression(node, valueLiteral(index), { computed: true }), arrayReceiver);
    const elementPlan = elementPattern?.type === 'ObjectPattern'
      && (guarded || keyedElement || elementPattern.properties.some(isRestProperty)
        || planNestedKeyedPatternCapture({ pattern: elementPattern, init: source })?.rest)
      && planRetainedObjectCapture({ pattern: elementPattern, init: source, assignment, prop,
        hostPath, adapter, resolveNodeType, injectorState, kind, entry, patternPath,
        probedInit, resolvePure, resolveStaticProp, planGuardedNarrow, isClaimedProp, isConsumedProp, meta: resolvedMeta });
    if (elementPlan && (guarded || keyedElement || elementPlan.rest || elementPlan.capture?.rest || elementPlan.nestedRest)) {
      return { arrayCapture: { ...capture, init }, elementPlan, elementPattern, assignment };
    }
  }

  if (!init || pattern?.type !== 'ObjectPattern') return null;
  // A selecting receiver with a user branch belongs to the per-branch mirror.
  const selection = kind === 'static' && computedKeyHasSideEffects(prop)
    ? unwrapRuntimeExpr(peelNestedSequenceExpressions(init).tail) : null;
  if ((selection?.type === 'ConditionalExpression' || selection?.type === 'LogicalExpression')
    && !allProxySelectingInit(selection, { adapter, injectorState })) return null;
  const guardedPlan = guarded && pattern.properties.includes(prop) && resolvePure ? planGuardedNarrow?.({
    memberNode: memberExpression(identifier(''), identifier(resolvedMeta.key)), parent: null,
    meta: resolvedMeta, path: hostPath, resolvePure, adapter,
  }) : null;
  const narrow = guardedPlan?.instanceFallback?.kind === 'instance' ? guardedPlan : null;
  const rest = pattern.properties.find(isRestProperty);
  if (rest && kind === 'instance') return null;
  if ((assignment || hasConstructorEntry(resolvedMeta?.object)) && kind === 'static' && !pattern.properties.includes(prop)) {
    const capture = planNestedKeyedPatternCapture({ pattern, init });
    if (capture?.rest && capture.leafPattern.properties.includes(prop) && resolvedMeta?.object && !resolvedMeta.guardedAliasHint) {
      const innerPlan = planRetainedObjectCapture({ pattern: capture.leafPattern, init, assignment, prop,
        hostPath, adapter, resolveNodeType, injectorState, kind, entry, resolvePure, resolveStaticProp,
        isClaimedProp, provenCtorName: resolvedMeta.object });
      if (innerPlan) return { capture, assignment, innerPlan: { ...innerPlan, coerceReceiver: true } };
    }
  }
  // A consumed nested static can extract before the outer rest copy. The receiver
  // proof excludes mutable slots and effectful getters, so its exclusion read is
  // repeatable; unrelated rest getters still run after the nested binding.
  if (rest && kind === 'static' && !pattern.properties.includes(prop)) {
    const nested = pattern.properties.find(item => item.value?.type === 'ObjectPattern'
      && item.value.properties.includes(prop));
    const key = nested && !nested.computed ? foldedPropertyKeyName(nested) : null;
    if (key !== null && pattern.properties.length === 2) {
      const receiver = memberExpression(installedWriteValue(init), valueLiteral(key), { computed: true });
      const proxyCtor = globalProxyMemberName({ node: receiver, scope: hostPath?.scope, adapter, path: hostPath });
      const ctor = proxyCtor
        ?? resolveObjectName({ objectNode: receiver, scope: hostPath?.scope, adapter, path: hostPath })
        ?? staticContainerReceiverName({ node: receiver, scope: hostPath?.scope, adapter, path: hostPath });
      const inner = ctor && planRetainedObjectCapture({ pattern: nested.value, init: receiver, assignment, prop,
        hostPath, adapter, resolveNodeType, injectorState, kind, entry, resolvePure, resolveStaticProp,
        isClaimedProp, provenCtorName: ctor });
      if (inner && (assignment || inner.restPure)) return { pattern, init, assignment, prop: nested, rest, primaryKey: key,
        nestedRest: { prop: nested, plan: inner, key } };
    }
  }
  if (assignment && kind === 'instance' && entry !== 'get-iterator-method' && !pattern.properties.includes(prop)) {
    const capture = planNestedKeyedPatternCapture({ pattern, init });
    if (capture?.leafPattern.properties.includes(prop)) return { capture };
  }
  const target = prop?.value?.type === 'AssignmentPattern' ? prop.value.left : prop?.value;
  // A consumed assignment yields its original receiver. The existing ordered capture already
  // keeps that receiver once, writes each claimed slot in source order, and yields the memo.
  const statement = assignment && hostPath ? peelToExpressionStatement(hostPath)?.exprStmt : null;
  const consumed = assignment && hostPath
    && (!assignmentValueDiscarded(hostPath) || kind !== 'global' && discardedSequenceElement(hostPath)
      || statement && isBodylessStatementSlot(statement.parentPath?.node, statement.node))
    && pattern.properties.includes(prop) && target?.type === 'Identifier';
  const nestedDefault = !assignment && pattern.properties.length > 1
    && pattern.properties.some(item => item.value?.type === 'AssignmentPattern' && item.value.left?.type === 'ObjectPattern');
  const symbolPatternCandidate = !assignment && pattern.properties.length > 1
    && pattern.properties.some(item => item.computed && item.value?.type === 'ObjectPattern');

  // the constructor the INIT itself names - what the capture memo holds. never the CLAIM's own
  // receiver: a nested claim names a level BELOW the init, so a name taken from there answers
  // `Array` where the memo holds the realm. the question is about the VALUE the init yields, so an
  // init spelled with its own effect prefix is asked of its tail - left raw, a sequence names
  // nothing and every sibling this render owes went out reading the static natively. memoized -
  // every asker below is on the dispatch path
  let initCtorMemo;
  function initCtorName() {
    if (initCtorMemo === undefined) {
      if (provenCtorName) return initCtorMemo = provenCtorName;
      const value = installedWriteValue(init);
      const receiver = adapter && (consumed || rest)
        ? agreeingTernaryArm(value, hostPath, adapter, { preservesEffects: true }) ?? value : value;
      initCtorMemo = adapter ? resolveObjectName({
        objectNode: receiver, scope: hostPath?.scope, adapter, path: hostPath,
      }) ?? staticContainerReceiverName({
        node: receiver, scope: hostPath?.scope, adapter, path: hostPath, rescuesReceiverRead: true,
      }) ?? null : null;
    }
    return initCtorMemo;
  }

  // A constructor with a pure entry supplies the entire rest source from its index.
  // The original receiver's effects still run once; captured ancestors already own theirs.
  const restPure = rest && pattern.properties.includes(prop) && hasConstructorEntry(initCtorName())
    && resolvePure?.({ kind: 'global', name: initCtorName() });
  if (restPure) return { pattern, init, assignment, rest, restPure,
    // A local alias already receives this file's chosen constructor index at its source.
    restSource: !provenCtorName && init?.type === 'Identifier'
      && adapter?.hasBinding(hostPath?.scope, init.name, hostPath) ? init : null,
    restEffects: provenCtorName ? [] : discardRescueNodesWithReads({ node: init,
      scope: hostPath?.scope, adapter, path: hostPath }) };

  // Resolve sibling statics that this capture must emit itself: assignment hosts and rest
  // captures cannot rely on later visitors to recover every claim from the minted receiver.
  // Rest may also retain a known pristine native static. Only binding targets qualify - and, on an
  // assignment host, a MEMBER target the extraction canon admits: the render writes whatever it is.
  function siblingStaticEntries() {
    const ctor = initCtorName();
    if ((!assignment && !rest) || !resolveStaticProp || !resolvePure || !ctor || !isStaticPlacement(ctor)) return null;
    const entries = new Map();
    for (const item of pattern.properties) {
      const memberRoot = { scope: hostPath?.scope, adapter, path: hostPath };
      if (item === prop || !isPropertyNode(item) || !(propBindingIdentifier(item.value)
        || (assignment && !rest && memberTargetTakesExtraction(item.value, memberRoot)))) continue;
      // the key names its slot through the SCOPE-AWARE canon, effects and all: a sibling spelled
      // `[(eff(), 'of')]` or `[K]` reads the same static as the bare `of` beside it, and named by a
      // literal-only reader it stayed on the memo reading that static raw. the key's own effects are
      // replayed by the render below, which is why nothing bails on them here; an effectful identity
      // CALL still declines, since only a consumer keeping the key node where it stands may fold one
      const keyName = resolveKey({
        node: item.key, computed: item.computed, scope: hostPath?.scope, adapter, path: hostPath, keepsKeyNode: true,
      });
      const resolved = resolveStaticProp({
        prop: item,
        receiverName: ctor,
        keyName,
        memberRoot,
        resolvePure: meta => resolvePure(meta) ?? (rest && !adapter?.isMutatedStatic?.(ctor, keyName)
          && item.value.type === 'Identifier' && (resolveBuiltIn(meta)?.kind === 'static'
            || Object.hasOwn(knownBuiltInReturnTypes.staticMethods[ctor] ?? {}, keyName))
          ? { kind: 'static', native: true } : null),
      });
      const takes = (resolved?.localName || resolved?.targetNode)
        && (resolved.pure.entry || (resolved.pure.native && resolved.pure.kind === 'static'));
      if (takes) {
        entries.set(item, { entry: resolved.pure.entry, hint: resolved.pure.hintName, native: resolved.pure.native, key: keyName });
      }
    }
    return entries.size ? entries : null;
  }

  // the route below RE-READS the receiver, which is free only where the init IS that name and
  // nothing else: an effect spelled ahead of it runs again on every re-read, so what the tail
  // names answers the memo's question, never this one
  const initReReadsFree = !peelNestedSequenceExpressions(init).prefix.length
    && isStaticPlacement(initCtorName() ?? '')
    // ... and where the init SPELLS it for free: a user getter typed to that name (`KE.A`) fires again
    && (isReReferenceableReceiver(init) || isReReadableSurfaceNav(unwrapRuntimeExpr(init),
      name => !!injectorState?.getBindingInfo?.(name), { ctx: { scope: hostPath?.scope, adapter, path: hostPath } }));

  // An extraction beside a SURVIVING residual crosses the keys that residual still performs: ahead
  // of it (an instance dispatch, a static over a quiet init) it overtakes every earlier key, behind
  // it (a static whose init runs code, the residual canon) it trails every later one. The order is
  // observable where either operation of a crossed pair runs code - a member target's setter, a
  // nested pattern's reads, a default or a key that runs, an instance read a user function's or
  // object's own accessor may answer - and only the ordered capture keeps every key in its slot.
  // A sibling CLAIM is no residual key: its own route extracts it in order beside this one, except
  // an instance claim whose target runs code, which takes this capture over what is left
  // (asked of the HOST's own pattern only: a nested or element level recursing here carries the host's
  // init, not the value that level reads)
  const keyOrderSplit = !!hostPath && !!adapter && !rest && pattern.properties.includes(prop)
    && pattern === (assignment ? hostPath.node?.left : hostPath.node?.id) && extractionCrossesResidualKeys();
  function extractionCrossesResidualKeys() {
    const index = pattern.properties.indexOf(prop);
    const ahead = kind === 'instance' || !residualInitRunsEffects({ init, scope: hostPath.scope, adapter, path: hostPath });
    const crossed = pattern.properties.filter(item => item !== prop && pattern.properties.indexOf(item) < index === ahead
      && !isClaimedProp?.(item) && !isConsumedProp?.(item));
    if (!crossed.length) return false;
    const claimRuns = destructureKeyRunsCode(prop) || claimReadRunsCode();
    return crossed.some(item => {
      const runs = destructureKeyRunsCode(item);
      if (!runs && !claimRuns) return false;
      const siblingKind = siblingClaimKind(item);
      return runs ? siblingKind !== 'static' : !siblingKind;
    });
  }
  function claimReadRunsCode() {
    if (kind !== 'instance' || isStaticPlacement(initCtorName() ?? '')) return false;
    const type = resolveNodeType?.(hostPath.get?.(assignment ? 'right' : 'init'));
    return type?.constructor === 'Function' || type?.constructor === 'Object';
  }
  function siblingClaimKind(item) {
    if (!isPropertyNode(item) || !resolvePure) return null;
    const levelPath = patternPath ?? hostPath.get?.(assignment ? 'left' : 'id');
    const { meta } = destructurePropLeafMeta({
      prop: item,
      objectPattern: levelPath,
      scope: hostPath.scope,
      path: levelPath,
      adapter,
      resolvePure,
      resolveStaticKey,
      parameterCallSites,
    });
    return meta ? resolvePure(meta)?.kind ?? null : null;
  }

  // A nested extraction stays between the outer siblings instead of overtaking their getters. An
  // assignment host re-spells an instance receiver in its overwrite, so it takes the capture wherever
  // reading the init again runs code (`KE.A` fires its getter a second time) - the residual canon's question.
  const nestedSibling = (!assignment || (kind === 'instance' && !!adapter
    && residualInitRunsEffects({ init, scope: hostPath?.scope, adapter, path: hostPath })))
    && (kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(prop)))
    && pattern.properties.filter(item => !isConsumedProp || !(isConsumedProp(item)
      || !computedKeyHasSideEffects(item) && patternFullyConsumed(item.value, isConsumedProp))).length > 1
    && !pattern.properties.includes(prop)
    && !(kind !== 'static' && adapter && !probedInit && initReReadsFree);
  const symbols = new Map();
  if (symbolPatternCandidate && hostPath && adapter) {
    for (const path of (patternPath ?? hostPath.get(assignment ? 'left' : 'id')).get('properties')) {
      if (foldedPropertyKeyName(path.node) !== null) continue;
      const { key: node, computed } = path.node;
      const key = resolveKey({ node, computed, scope: path.scope, adapter, path });
      if (key !== null && symbolSourcedFoldedKey({ key, keyNode: node, scope: path.scope, adapter, path })
        && toHint(resolveNodeType?.(path.get('key'))) === 'symbol') symbols.set(path.node, { hint: key });
    }
  }
  const symbolPattern = symbolPatternCandidate && [...symbols].some(
    ([item, symbol]) => symbol.hint === 'Symbol.iterator' && item.value?.type === 'ObjectPattern',
  );
  const proxyMemberElement = !assignment && init.type === 'ArrayExpression' && init.elements.some(
    element => globalProxyMemberName({
      node: peelTransparentExpr(element), scope: hostPath?.scope, adapter, path: hostPath,
    }) !== null,
  );
  if (!narrow && !consumed && !rest && !nestedDefault && !symbolPattern && !nestedSibling
    && !((assignment || pattern.properties.length > 1 || proxyMemberElement)
      && pattern.properties.includes(prop) && computedKeyHasSideEffects(prop))
    && !(assignment && target?.type === 'MemberExpression' && pattern.properties.includes(prop))
    && !keyOrderSplit) return null;
  const primaryStatic = (consumed || rest) && kind !== 'instance' && initCtorName() && resolveStaticProp
    ? resolveStaticProp({ prop, receiverName: initCtorName(), resolvePure,
      keyName: resolveKey({
        node: prop.key, computed: prop.computed, scope: hostPath.scope, adapter, path: hostPath, keepsKeyNode: true,
      }) }) : null;
  if ((consumed || rest) && kind !== 'instance' && !primaryStatic) return null;
  const retainedStatic = (consumed || rest ? !!primaryStatic : kind === 'static' || kind === 'global')
    && (!assignment || target?.type === 'Identifier' || (keyOrderSplit
      && !!memberTargetTakesExtraction(prop.value, { scope: hostPath.scope, adapter, path: hostPath })))
    && pattern.properties.includes(prop)
    && (consumed || rest || symbolPattern || computedKeyHasSideEffects(prop) || keyOrderSplit);
  if (kind !== 'instance' && !symbolPattern && !retainedStatic && !nestedSibling) return null;
  if (!provenCtorName && !symbolPattern && !nestedSibling && adapter
    && allProxySelectingInit(init, { adapter, injectorState })) return null;
  const siblingStatics = siblingStaticEntries();
  // Rest gathers the original receiver with the same exclusions. Only pristine statics
  // admit the repeated exclusion reads; user getters stay on the ordinary native route.
  // Key effects run with their ordered writes, then the exclusions use their folded keys.
  if (rest && (!retainedStatic || pattern.properties.some(item => item !== rest
    && (!propBindingIdentifier(item.value) || (item !== prop && !siblingStatics?.has(item)))))) return null;
  return { pattern, init, assignment, prop, narrow, retainedStatic, primaryPure: primaryStatic?.pure,
    siblingStatics, rest,
    // the receiver IS a constructor the read side names, on a spelling that cannot come out nullish
    // (no `?.`, no lowered short-circuit): the null rejection the keyed read would keep in front of
    // the key's effects is dead there
    provenReceiver: !narrow && !!isStaticPlacement(initCtorName() ?? '') && !valueMayBeNullish(init),
    // ... and a receiver that cannot come out nullish at all, narrowed or not (a selection whose
    // fallback is proven, `x || Object`): the guarded read keeps no rejection in front of it either
    receiverNeverNullish: keyedReadReceiverProven({ init, hostPath, adapter }),
    primaryKey: rest ? resolveKey({
      node: prop.key,
      computed: prop.computed,
      keepsKeyNode: true,
      scope: hostPath.scope,
      adapter,
      path: hostPath,
    }) : null,
    // the props an EARLIER channel already owns: its write stands where the source's claim was
    // taken, so this render neither re-extracts them nor re-spells them off the memo - a native
    // re-read there would overwrite that write with the realm's own value. one binding's channel
    // removes such a prop before this render sees it, the other's defers the removal to its drain,
    // and the render owes the same output either way
    claimedProps: assignment && isClaimedProp
      ? new Set(pattern.properties.filter(item => isClaimedProp(item))) : null };
}

// the receiver of a keyed destructure read IS a constructor the read side names, on a spelling that
// cannot come out nullish (no `?.`, no lowered short-circuit): the null-first rejection the read keeps
// in front of the key's effects is dead there
export function keyedReadReceiverProven({ init, hostPath, adapter }) {
  if (!adapter || !init || valueMayBeNullish(init)) return false;
  let value = installedWriteValue(init);
  // a `||` / `??` selection yields its LEFT only where that is truthy / non-nullish, so a right operand
  // proven here proves the whole value (`x || Object`): the null probe would guard a value never nullish
  for (let selection = unwrapRuntimeExpr(value); selection?.type === 'LogicalExpression' && selection.operator !== '&&';
    selection = unwrapRuntimeExpr(value)) value = installedWriteValue(selection.right);
  const name = resolveObjectName({ objectNode: value, scope: hostPath?.scope, adapter, path: hostPath })
    ?? staticContainerReceiverName({ node: value, scope: hostPath?.scope, adapter, path: hostPath, rescuesReceiverRead: true });
  return !!isStaticPlacement(name ?? '');
}

// Keep native property patterns around the claimed read so keys, defaults and sibling
// effects retain their positions. A static-only rest uses one native exclusion pattern.
// eslint-disable-next-line max-statements -- one ordered render for every retained property role
export function renderRetainedObjectCapture(plan, {
  mintRef,
  mintDeclaredRef,
  injectImport,
  entry,
  hintName,
  embed = node => node,
  anchorPure = null,
  noteStaticAlias = null,
  mintUnused = mintRef,
  claimProperties = null,
  ctx = null,
}) {
  if (plan.restPure) {
    claimProperties?.(plan.pattern.properties.filter(item => item.type !== 'RestElement'));
    const pattern = embed(plan.pattern);
    const init = plan.restSource ? embed(plan.restSource) : sequenceExpression([...plan.restEffects.map(embed),
      identifier(injectImport(plan.restPure.entry, plan.restPure.hintName))]);
    return plan.assignment ? { expression: assignmentExpression('=', pattern, init) }
      : { declarations: [variableDeclarator(pattern, init)] };
  }
  if (plan.arrayCapture || plan.capture && !plan.assignment && plan.innerPlan) {
    const capturePlan = plan.arrayCapture ?? plan.capture;
    const elementPattern = plan.elementPattern ?? capturePlan.leafPattern;
    const renderCapture = plan.arrayCapture ? renderArrayWrapperCapture : renderNestedKeyedPatternCapture;
    const captured = renderCapture({ ...capturePlan, init: plan.init ?? capturePlan.init }, {
      mintRef: plan.assignment ? mintDeclaredRef : mintRef, embed,
    });
    const inner = renderRetainedObjectCapture({ ...plan.elementPlan ?? plan.innerPlan,
      init: identifier(captured.elements.find(element => element.pattern === elementPattern).ref) }, {
      mintRef, mintDeclaredRef, injectImport, entry, hintName, embed,
      anchorPure, noteStaticAlias, mintUnused, claimProperties,
    });
    if (!plan.assignment) return {
      declarations: [captured.capture, ...captured.elements.flatMap(element => element.pattern === elementPattern
        ? inner.declarations : [element.declarator])],
    };
    const result = identifier(mintDeclaredRef());
    return { expression: sequenceExpression([
      assignmentExpression('=', captured.capture.id,
        assignmentExpression('=', result, captured.capture.init)),
      ...captured.elements.map(element => element.pattern === elementPattern ? inner.expression
        : assignmentExpression('=', element.declarator.id, element.declarator.init)), result,
    ]) };
  }
  if (plan.capture) return renderNestedKeyedPatternCapture({ ...plan.capture, init: plan.init ?? plan.capture.init }, {
    mintRef: mintDeclaredRef, embed, assignment: true, preserveResult: true, injectImport, anchorPure,
    renderLeaf: plan.innerPlan ? init => renderRetainedObjectCapture({ ...plan.innerPlan, init }, {
      mintRef, mintDeclaredRef, injectImport, entry, hintName, embed: node => node === init ? node : embed(node),
      anchorPure, noteStaticAlias, mintUnused, claimProperties,
    }).expression : null,
  });
  entry = plan.primaryPure?.entry ?? entry;
  hintName = plan.primaryPure?.hintName ?? hintName;
  const ref = identifier(plan.assignment ? mintDeclaredRef() : mintRef());
  const init = embed(plan.init);
  const declarations = [variableDeclarator(ref, init)];
  const assignments = [];
  for (const prop of plan.pattern.properties) {
    if (plan.claimedProps?.has(prop)) continue;
    const assignmentStart = assignments.length;
    if (prop === plan.rest) {
      const sentinel = plan.assignment ? identifier(mintUnused(true)) : null;
      const residual = objectPattern(plan.pattern.properties.map(item => item === prop
        ? embed(item) : objectProperty(item.computed
          ? valueLiteral(item === plan.prop ? plan.primaryKey : plan.siblingStatics.get(item).key)
          : embed(cloneNode(item.key)), sentinel ?? identifier(mintUnused(false)))));
      claimProperties?.(residual.properties.filter(item => item.type !== 'RestElement'));
      if (plan.assignment) assignments.push(assignmentExpression('=', residual, ref));
      else declarations.push(variableDeclarator(residual, ref));
    } else if (prop === plan.nestedRest?.prop) {
      const nestedInit = memberExpression(ref, valueLiteral(plan.nestedRest.key), { computed: true });
      const inner = renderRetainedObjectCapture({ ...plan.nestedRest.plan,
        init: nestedInit }, {
        mintRef, mintDeclaredRef, injectImport, entry, hintName, embed: node => node === nestedInit ? node : embed(node),
        anchorPure, noteStaticAlias, mintUnused, claimProperties,
      });
      if (plan.assignment) assignments.push(inner.expression);
      else declarations.push(...inner.declarations);
    } else if (plan.retainedStatic && !plan.assignment && prop === plan.prop) {
      // The key observes the old binding; later siblings observe the initialized pure value.
      const target = prop.value.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      if (plan.primaryPure?.kind !== 'global' && target.type === 'Identifier') noteStaticAlias?.(target.name, entry);
      const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
      const keys = observableSequenceElements([...prefix, tail], ctx).map(embed);
      const read = identifier(injectImport(entry, hintName));
      declarations.push(plan.provenReceiver
        ? variableDeclarator(embed(target), keys.length ? sequenceExpression([...keys, read]) : read)
        : renderKeyedDestructureRead({ receiverName: ref.name, receiver: ref, binding: embed(target), keys, read }).at(-1));
    } else if (!plan.assignment && prop === plan.prop && entry) {
      const defaulted = prop.value.type === 'AssignmentPattern';
      const target = defaulted ? prop.value.left : prop.value;
      // The guarded plan owns both the static branch and its instance fallback.
      let read = plan.narrow ? renderCtorIdentityNarrow(plan.narrow, null, { injectImport, spellRecv: () => ref })
        : callExpression(identifier(injectImport(entry, hintName)), [ref]);
      if (defaulted) {
        const memo = identifier(mintDeclaredRef());
        read = renderInstanceDefaultGuard({ assignedRef: memo, call: read, reread: memo,
          defaultValue: embed(prop.value.right), defaultName: target.name });
      }
      const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
      const keyEffects = prop.computed ? observableSequenceElements([...prefix, tail], ctx).map(embed) : [];
      declarations.push(renderKeyedDestructureRead({
        receiverName: ref.name,
        receiver: ref,
        binding: embed(target),
        keys: keyEffects,
        read,
        proven: plan.receiverNeverNullish,
      }).at(-1));
    } else if (plan.assignment && prop === plan.prop) {
      const defaulted = prop.value.type === 'AssignmentPattern';
      const target = defaulted ? prop.value.left : prop.value;
      if (plan.retainedStatic && plan.primaryPure?.kind !== 'global' && target.type === 'Identifier') {
        noteStaticAlias?.(target.name, entry);
      }
      const pure = plan.narrow ? null : identifier(injectImport(entry, hintName));
      // The guarded plan owns both the static branch and its instance fallback.
      let read = plan.narrow ? renderCtorIdentityNarrow(plan.narrow, null, { injectImport, spellRecv: () => ref })
        : plan.retainedStatic ? pure : callExpression(pure, [ref]);
      if (defaulted && !plan.retainedStatic) {
        const memo = identifier(mintDeclaredRef());
        read = renderInstanceDefaultGuard({ assignedRef: memo, call: read, reread: memo,
          defaultValue: embed(prop.value.right), defaultName: target.name });
      }
      const write = assignmentExpression('=', embed(target), read);
      const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
      const keyEffects = prop.computed ? observableSequenceElements([...prefix, tail], ctx).map(embed) : [];
      assignments.push(keyEffects.length ? sequenceExpression([...keyEffects, write]) : write);
    } else if (plan.siblingStatics?.has(prop)) {
      // the polyfill is always defined, so the user's default over it is dead text and drops
      const { entry: siblingEntry, hint, native, key } = plan.siblingStatics.get(prop);
      const target = prop.value.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      if (!native && target.type === 'Identifier') noteStaticAlias?.(target.name, siblingEntry);
      const read = native ? memberExpression(ref, valueLiteral(key), { computed: true }) : identifier(injectImport(siblingEntry, hint));
      const siblingWrite = assignmentExpression('=', embed(target), read);
      // the read is gone, the key's own effects are not: they ran where the source spelled them
      const { prefix: siblingPrefix, tail: siblingTail } = peelNestedSequenceExpressions(prop.key);
      const siblingKeyEffects = prop.computed
        ? observableSequenceElements([...siblingPrefix, siblingTail], ctx).map(embed) : [];
      if (plan.assignment) {
        assignments.push(siblingKeyEffects.length
          ? sequenceExpression([...siblingKeyEffects, siblingWrite]) : siblingWrite);
      } else declarations.push(variableDeclarator(embed(target), siblingKeyEffects.length
        ? sequenceExpression([...siblingKeyEffects, read]) : read));
    } else {
      const pattern = embed({ ...plan.pattern, properties: [prop] });
      if (plan.assignment) assignments.push(assignmentExpression('=', pattern, ref));
      else declarations.push(variableDeclarator(pattern, ref));
    }
    // A computed key rejects null before its effects. A plain member target is evaluated
    // first, so keep its native assignment ahead of the property read's null rejection.
    if (plan.assignment && prop.computed && !plan.provenReceiver) {
      assignments.push(conditionalExpression(nullFirstGuardTest(ref),
        memberExpression(ref, valueLiteral(''), { computed: true }), sequenceExpression(assignments.splice(assignmentStart))));
    }
  }
  // the memo leads the rebuilt expression, so an effect the source ran AHEAD of the pattern runs
  // there, once, in the slot the source gave it - this render performs it and no channel may lift
  // it a second time. reading the bare tail instead would take the prefix out of the tree before
  // the walk reaches it, and the claims INSIDE it go out unrendered
  return plan.assignment ? { refName: ref.name, expression: sequenceExpression([
    assignmentExpression('=', ref, init),
    ...plan.coerceReceiver ? [assignmentExpression('=', objectPattern([]), ref)] : [],
    ...assignments, ref,
  ]) } : { refName: ref.name, declarations };
}

// --- the minifier-sequence split ---
// `(prefixExpr, ..., ({pat} = R), ...);` collapses a destructure assignment into ANY slot of a
// statement-position SequenceExpression (a minified tail, comma-joined statements, nested
// sequences), a shape the destructure gates peel past only Paren+TS and so silently bail on. the
// plan lists every such statement with the products that replace it: one ExpressionStatement per
// operand, in source order (statement context discards every operand's value, so the split is
// sound at any position). an operand that is itself a minifier sequence splits in the same plan,
// so the tree is walked once and no fixpoint over it is needed. each product carries its operand's
// own span - `start` / `end`, and the `loc` a parser gave it - so the products read as the
// author's own statements to everything that asks a STATEMENT where it stands: the entry
// detection, which takes a span-less statement for a sibling's synthesis and skips it (babel), and
// asks the opt-out gate of the entry statement whole (unplugin); the print's own margins. a claim
// inside a product is asked by its own node, spans or not. a statement-list member is
// planned with its list; an un-braced control-flow slot (`if (c) (eff(), ({ at } = src));`) holds
// ONE statement and is planned with its host and key, the binding bracing the slot around the
// products (a block around a sequence's operands declares nothing, so the added scope is
// unobservable). `embed` wraps each operand for the binding's dialect - `hostSlot` on babel,
// identity where the tree already is canonical ESTree. the surgery is the binding's: babel
// converts the products and inherits the replaced statement's attached comments, unplugin
// splices as is. the entries hold nodes, so a binding applies them by identity and reads a
// statement's index at apply time
export function planMinifierSequenceSplit(root, { embed = node => node } = {}) {
  const plan = [];
  // one operand's products: every operand that is not a quiet literal (`isQuietLiteralOperand` -
  // the minifier's `0`, a string that must not become a directive), in order
  function operandProducts(operand) {
    if (isQuietLiteralOperand(operand)) return [];
    const nested = getMinifierSequenceExpressions(expressionStatement(operand));
    if (nested) return nested.flatMap(operandProducts);
    const product = expressionStatement(embed(operand));
    product.start = operand.start;
    product.end = operand.end;
    product.loc = operand.loc;
    return [product];
  }
  function statementProducts(statement) {
    const expressions = getMinifierSequenceExpressions(statement);
    return expressions ? expressions.flatMap(operandProducts) : null;
  }
  forEachStatementPosition(root, {
    onList(statements) {
      for (const statement of statements) {
        const products = statementProducts(statement);
        if (products) plan.push({ statements, statement, products });
      }
    },
    onUnbracedSlot(host, key) {
      const products = statementProducts(host[key]);
      if (products) plan.push({ host, key, statement: host[key], products });
    },
  });
  return plan;
}
