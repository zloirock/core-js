import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  bindingDeclarationPath,
  isTSTypeOnlyIdentifierPath,
  SINGLE_STATEMENT_SLOTS,
  markCapturedKeyedPattern,
  isCapturedKeyedPattern,
  allProxySelectingInit,
  arrayLiteralSlotValue,
  bodyRunsAtInvocation,
  argumentOverridesSlot,
  assignmentValueDiscarded,
  discardedSequenceElement,
  computedKeyHasSideEffects,
  forOfHeadIterableElements,
  findNearestVarScopeOwner,
  FUNCTION_LIKE_NODE_TYPES,
  functionScopeBindsVarOrFunction,
  collectFileCensus,
  flattenBranchingValueNodes,
  foldedPropertyKeyName,
  followConstLiteralAlias,
  getMinifierSequenceExpressions,
  isPristineProxyGlobal,
  isQuietLiteralOperand,
  isPropertyNode,
  isMemberAccessNode,
  isMemberWriteHost,
  isRestProperty,
  installedWriteValue,
  mayHaveSideEffects,
  noReassignmentReachesUsage,
  propBindingIdentifier,
  observableSequenceElements,
  objectLevelPairedProperty,
  ownRelocatedHeadElement,
  patternBoundAliasSlotInit,
  patternKeepsEffectfulKey,
  patternSlotTarget,
  patternSlotCertainDefault,
  prototypeChainMayLend,
  provablyPrecedes,
  pureImportSourceEntry,
  parameterStaticSource,
  paramListReadsName,
  pairedArrayWrapInitElement,
  positionalElements,
  resolveCallArgument,
  referencesArgumentsObject,
  readRunsDeferredWithin,
  throwCatchHandler,
  statementListOf,
  subtreeContainsNode,
  patternFullyConsumed,
  peelNestedSequenceExpressions,
  peelTransparentExpr,
  peelToExpressionStatement,
  isBodylessStatementSlot,
  runsWithoutOwnVarSlot,
  runsAtImmediateInvocation,
  unwrapRuntimeExpr,
  walkAstNodes,
  walkPatternIdentifiers,
  valueMayBeNullish,
  POSSIBLE_GLOBAL_OBJECTS,
} from './helpers/ast-patterns.js';
import {
  assignmentExpression,
  binaryExpression,
  blockStatement,
  callExpression,
  cloneNode,
  conditionalExpression,
  expressionStatement,
  identifier,
  literal as valueLiteral,
  memberFromKeyName,
  memberExpression,
  objectExpression,
  objectPattern,
  objectProperty,
  nullFirstGuardTest,
  renderCtorIdentityNarrow,
  renderInstanceDefaultGuard,
  renderKeyedDestructureRead,
  renderPositionalDestructurePlan,
  sequenceExpression,
  variableDeclaration,
  variableDeclarator,
  voidZero,
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
  destructureKeyRunsCode,
  destructurePropLeafMeta,
  orderedClaimCapture,
  planNestedKeyedPatternCapture,
  flattenFallbackBranches,
  isReReferenceableAcrossReads,
  isReReferenceableReceiver,
  isConstantLiteralReceiver,
  patternComputedKeysSynthSafe,
  PATTERN_CHAIN_TYPES,
  pairedDefaultArm,
  buildParameterArgumentSynthPlan,
  buildNestedParamSynthPlan,
  destructurePatternHostPath,
  renderSynthTree,
  synthPropDedupKey,
  receiverValueNeverNullish,
  residualInitRunsEffects,
  staticContainerReceiverName,
  wrapperElementNavPlacement,
} from './detect-usage/destructure.js';
import { hasConstructorEntry, resolve as resolveBuiltIn } from './index.js';
import { SYMBOL_ITERATOR_PURE_RESULT, isSourcedSymbolIteratorMeta } from './detect-usage/globals.js';

export { isBodylessStatementSlot, planNestedKeyedPatternCapture };

// shape classification for destructure hosts (VariableDeclaration / AssignmentExpression
// inside ExpressionStatement): the parser-agnostic booleans both plugins consume -
// `isExport` / `isForInit` / `isBodyless` / `isMultiDecl` - and the plan of the one host
// rewrite both plugins owe ahead of detection, the minifier-sequence split. everything here
// operates on raw AST nodes, so callers pass nodes from either babel paths or estree-toolkit
// paths; the surgery that lands a plan in the host tree is each binding's own

// the shape a bodyless slot takes back from its drain: ONE statement stays bare, several brace a
// block - unless the host is a `var` declaration and every statement declares: those join as the
// declarators of ONE `var`, the slot's own statement (babel's shape; a memo minted `const` rides
// along as `var`, the function-scoped binding the other leg declares there too).
// `embed` preserves host nodes at the render boundary, after classifying their shapes.
export function bodylessSlotReplacement(hostNode, statements, embed = node => node) {
  if (statements.length === 1) return embed(statements[0]);
  if (hostNode?.type === 'VariableDeclaration' && hostNode.kind === 'var'
    && statements.every(stmt => stmt.type === 'VariableDeclaration')) {
    return variableDeclaration('var', statements.flatMap(stmt => stmt.declarations.map(embed)));
  }
  return blockStatement(statements.map(embed));
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

// Place a nested leaf's flat twin without crossing another declarator. An outer object
// sibling requires a separate statement at the declaration's end. Exports retain their
// existing route. A paired array element belongs to the shared array plan, the only
// caller that asks (`pairing`) for its nav placement. Any other caller reaches the host
// after that plan declined it: a twin written into the element only re-enters the plan,
// and one beside the declaration binds the leaf after later declarators, so the host
// keeps its native pattern. A pairing the host cannot place (an assignment's right side)
// is declined too: as a plain object host its twin would drop the other elements.
// Assignment callers supply the already-admitted discarded statement; its leaf checks
// are `assignmentTwinLeafAdmitted`. This query neither rewrites nor registers the host.
export function planNestedLeafHost(walk, assignmentStatement = null, { pairing = false } = {}) {
  if (assignmentStatement === false) return null;
  const { declarator } = walk;
  const wrapper = pairing && walk.wrapper && unwrapRuntimeExpr(declarator?.node?.init) === walk.wrapperRoot ? walk.wrapper : null;
  if (walk.wrapper && !wrapper) return null;
  const navPlacement = wrapper ? wrapperElementNavPlacement(walk) : null;
  const siblingLevel = !wrapper && walk.climbed.slice(1).some(level => level.pattern.properties.length > 1);
  const pattern = declarator?.node?.id ?? declarator?.node?.left;
  if (wrapper ? !navPlacement || walk.hostPattern?.node?.properties?.length !== 1
    : pattern?.type !== 'ObjectPattern' || (pattern.properties.length !== 1 && !siblingLevel)) return null;
  const declaration = assignmentStatement ?? declarator.parentPath;
  if (!assignmentStatement && (declaration?.node?.type !== 'VariableDeclaration'
    || declaration.parentPath?.node?.type === 'ExportNamedDeclaration')) return null;
  const parent = declaration.parentPath?.node;
  const forInit = isForInitDeclaration(parent, declaration.node);
  const bodyless = !forInit && !statementListOf(parent);
  if (bodyless && !isBodylessStatementSlot(parent, declaration.node)) return null;
  if (siblingLevel && (forInit || bodyless)) return null;
  // an assignment has no declaration to split the hop into: its twin replaces the whole target, and
  // the siblings at the kept level - their keys' effects and bindings - would leave with it
  if (siblingLevel && assignmentStatement) return null;
  const declarators = declaration.node.declarations ?? [];
  const index = declarators.indexOf(declarator.node);
  if (wrapper && !forInit && index !== 0 && index !== declarators.length - 1) return null;
  if (siblingLevel && index !== declarators.length - 1) return null;
  return { declaration, wrapper, navPlacement, siblingLevel, forInit, bodyless };
}

// The leaf an assignment statement's flat twin takes: several plain bindings, no rest, and no key
// whose effect must run between the claims. An effect-free computed key folds like a plain one or
// stays in the residual.
export function assignmentTwinLeafAdmitted(leafPattern, ctx = null) {
  return leafPattern.properties.length > 1 && leafPattern.properties.every(item => !isRestProperty(item)
    && !computedKeyHasSideEffects(item, ctx) && patternSlotTarget(item.value)?.type === 'Identifier');
}

// A loop-head extraction cannot re-read an element after its neighbours have evaluated: they may
// replace its binding. A later pattern also reads in source order, after the earlier extraction.
// Capture the positions once, then let each element's own declarations consume its captured value.
// This query declines array rest and opaque spreads. A forced capture can retain
// a literal spread whose expanded positions are statically known, or one after
// every captured position when its caller proves that prefix is fixed.
export function planArrayWrapperCapture({
  pattern,
  init,
  force = false,
  restPattern = null,
  adapter = null,
  injectorState = null,
  nestedOnly = false,
  trailingSpread = false,
  ctx = null,
}) {
  if (restPattern && restPattern.properties?.at(-1)?.type !== 'RestElement'
    && !restPattern.properties?.some(prop => computedKeyHasSideEffects(prop, ctx))) return null;
  const array = peelTransparentExpr(init);
  if (pattern?.type !== 'ArrayPattern' || !init || (!force && array?.type !== 'ArrayExpression')) return null;
  // The declaration fallback captures the positions of a literal wrapper whose element carries an
  // opaque NESTED claim (a call, a member, a selection - anything but an object literal, which keeps
  // its slot pairing and carried initializer) before a sibling can stage an extraction. The whole
  // literal is captured, so every element reads once, in source order, ahead of the per-element
  // patterns - a sibling beside the claim rides the same capture (`[{ y: { at } }, tail] = [mk(),
  // eff()]`), and a wrapper nested one level deeper descends to its own element.
  if (nestedOnly && !wrapperCarriesOpaqueNestedClaim(pattern, array, ctx)) return null;
  const elements = [];
  function collectCaptureElements(level, value, path = []) {
    const literal = peelTransparentExpr(value);
    if ((!force && literal?.type !== 'ArrayExpression')
      || level.elements.some(element => element?.type === 'RestElement')
      || (literal?.elements?.some(element => element?.type === 'SpreadElement')
        && (!force || !positionalElements(literal.elements)
          && (!trailingSpread
            || literal.elements.findIndex(element => element?.type === 'SpreadElement') < level.elements.length)))) return false;
    return level.elements.every((slot, index) => {
      if (!slot) return true;
      const position = [...path, index];
      const source = literal?.type === 'ArrayExpression' ? resolveCallArgument(literal.elements, index) : null;
      if (slot.type === 'ArrayPattern') return collectCaptureElements(slot, source, position);
      // a default re-reads a missing slot; one the paired value rules out is the flat twin's element
      const element = slot.type === 'AssignmentPattern' ? deadDefaultElementPattern(slot, source, ctx) : slot;
      if (!element) return false;
      // Realm rest patterns already have a receiver mirror that keeps their static siblings.
      if (element === restPattern && source && adapter && allProxySelectingInit(source, { adapter, injectorState })) return false;
      const id = element.type === 'RestElement' ? element.argument : element;
      let nativeBinding = false;
      if (id?.type === 'Identifier' && ctx?.path?.node?.type === 'VariableDeclarator') {
        const binding = adapter?.getBinding?.(ctx.scope, id.name, ctx.path);
        const declaration = bindingDeclarationPath(binding)?.node;
        const frame = findNearestVarScopeOwner(ctx.path)?.node;
        const refs = ['let', 'const'].includes(binding?.kind) && declaration?.id
          && subtreeContainsNode(declaration.id, element)
          ? adapter.collectBindingReferences?.(ctx.path, id.name, { closed: true }) : null;
        nativeBinding = !!frame && !!refs && refs.every(ref => isTSTypeOnlyIdentifierPath(ref)
          || !readRunsDeferredWithin(ref, frame) && provablyPrecedes(ctx.path.node, ref.node));
      }
      elements.push({ pattern: element, index: position[0], path: position, ...nativeBinding && { nativeBinding } });
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

// the pattern an array-wrapper ELEMENT with a DEFAULT destructures off the slot it pairs: the
// default's left where the paired value makes that default DEAD - the element then reads the value
// exactly as its flat twin does. a BORN or OPEN arm answers null: the default may run, and the
// mirror plan, reading the same verdict, owns it
export function deadDefaultElementPattern(element, source, ctx) {
  return element?.type === 'AssignmentPattern' && element.left?.type === 'ObjectPattern' && source && ctx
    && pairedDefaultArm(source, ctx) === 'dead' ? element.left : null;
}

// does a literal wrapper hold, at some element, a nested keyed pattern over an OPAQUE value - the
// shape the declaration fallback captures? the pattern and the literal pair position for position
// (a spread shifts them, a default re-reads a missing slot), a nested wrapper descends to its own
// element, and the claim's slot is a value the source COMPUTES - a call, a member (a getter a
// re-read would fire twice), a selection, a kept write. a bare name re-reads for free and keeps its own routes
// (`[rec]`, `[globalThis]` - the user-key twin off the global object must stay native), and an
// object literal pairs by key already
function wrapperCarriesOpaqueNestedClaim(pattern, array, ctx) {
  if (array?.type !== 'ArrayExpression' || pattern.elements.length !== array.elements.length
    || array.elements.some(element => element?.type === 'SpreadElement')
    || pattern.elements.some(element => element?.type === 'AssignmentPattern' || element?.type === 'RestElement')) return false;
  return pattern.elements.some((element, index) => {
    const source = array.elements[index];
    if (!element || !source) return false;
    if (element.type === 'ArrayPattern') return wrapperCarriesOpaqueNestedClaim(element, peelTransparentExpr(source), ctx);
    const value = peelTransparentExpr(peelNestedSequenceExpressions(peelTransparentExpr(source)).tail);
    const opaque = value?.type === 'CallExpression' || value?.type === 'OptionalCallExpression'
      || value?.type === 'MemberExpression' || value?.type === 'OptionalMemberExpression'
      || value?.type === 'ConditionalExpression' || value?.type === 'LogicalExpression' || value?.type === 'AssignmentExpression';
    return opaque && element.type === 'ObjectPattern'
      && planNestedKeyedPatternCapture({ pattern: element, init: source, force: true, ctx })?.leafPattern.properties.length === 1;
  });
}

// Reuse only a stable name from the original literal position. The full RHS still runs
// before any pattern read; a member value always keeps its one property access.
export function reusableArrayCaptureReceiver(capture, element, ctx) {
  const receiver = element.path.reduce((node, index) => pairedArrayWrapInitElement(
    unwrapRuntimeExpr(node)?.elements ?? [], index,
  ), capture.init);
  const tail = unwrapRuntimeExpr(peelNestedSequenceExpressions(receiver).tail);
  return tail?.type === 'Identifier' && isReReferenceableAcrossReads(tail, ctx) ? tail : null;
}

// The capture and the per-element declarations share each required snapshot. A reused receiver
// keeps its RHS evaluation at the original slot, without a binding there. `embed`
// is the binding's source-node boundary; the patterns move rather than being interpreted here, and
// `retain` places them where a binding's `embed` copies, so a kept leaf keeps its node identity.
// A rest keeps its native collection in the capture and binds its argument at the source slot.
export function renderArrayWrapperCapture(plan, { mintRef, embed = node => node, retain = embed }) {
  const refs = new Map();
  const nativeBindings = new Set();
  const reusedReceivers = new Set();
  const elements = plan.elements.map(element => {
    const ref = element.nativeBinding
      ? (element.pattern.type === 'RestElement' ? element.pattern.argument : element.pattern).name
      : element.receiver?.name ?? (element.receiverUnused ? null : mintRef());
    refs.set(element.pattern, ref);
    if (element.nativeBinding) nativeBindings.add(element.pattern);
    if (element.receiver) reusedReceivers.add(element.pattern);
    return {
      ...element,
      ref,
      declarator: element.receiverUnused || element.nativeBinding ? null : variableDeclarator(
        retain(element.pattern.type === 'RestElement' ? element.pattern.argument : element.pattern),
        identifier(ref),
      ),
    };
  });
  function capturePattern(pattern) {
    if (!pattern) return null;
    // an element captured as its default's left had that default proven dead: the ref replaces both
    const source = refs.has(pattern) ? pattern : pattern.type === 'AssignmentPattern' && refs.has(pattern.left) ? pattern.left : null;
    if (nativeBindings.has(source)) return pattern;
    if (reusedReceivers.has(source)) return null;
    if (source && refs.get(source) === null) return objectPattern([]);
    const ref = source ? refs.get(source) : undefined;
    if (ref) return pattern.type === 'RestElement' ? { ...pattern, argument: identifier(ref) } : identifier(ref);
    if (pattern.type === 'ArrayPattern') return { ...pattern, elements: pattern.elements.map(capturePattern) };
    // a keyed level above the positions: only its last property leads down, the rest stay as written
    if (!plan.keyed?.has(pattern)) return pattern;
    if (pattern.type === 'AssignmentPattern') return { ...pattern, left: capturePattern(pattern.left) };
    const hop = pattern.properties.at(-1);
    return { ...pattern, properties: [...pattern.properties.slice(0, -1), { ...hop, value: capturePattern(hop.value) }] };
  }
  return {
    capture: variableDeclarator(embed(capturePattern(plan.pattern)), embed(plan.init)),
    elements,
  };
}

// Retain a sole static leaf's native pattern reads, replacing only its binding/default.
// The source plan has already proved every surrounding hop safe to read natively.
function renderStaticSentinelPattern(pattern, mintUnused) {
  const native = cloneNode(pattern);
  walkAstNodes({
    root: native,
    visit(node, parent) {
      if (parent?.type === 'ObjectPattern' && isPropertyNode(node) && propBindingIdentifier(node.value)) {
        node.value = identifier(mintUnused());
        node.shorthand = false;
      }
    },
  });
  return native;
}

// Render the complete array host. A capture keeps each element's original value;
// its native fragments and independent reads then follow source property order.
// Bindings supply imports, memo names, source embedding and comment attachments only.
export function renderArrayDestructurePlan(plan, {
  kind,
  init,
  embed,
  retain = embed,
  read,
  injectImport,
  mintRef,
  mintDeclaredRef,
  mintUnused,
  decorate = node => node,
}) {
  if (plan.array.objectCapture) {
    const outer = renderNestedKeyedPatternCapture(plan.array.objectCapture, { mintRef, embed });
    const leaf = outer.elements.find(element => element.pattern === plan.array.objectCapture.leafPattern);
    const inner = renderArrayDestructurePlan({
      ...plan,
      array: { ...plan.array, objectCapture: null, capture: { ...plan.array.capture, init: identifier(leaf.ref) } },
    }, { kind, init, embed, retain, read, injectImport, mintRef, mintDeclaredRef, mintUnused, decorate });
    return [{ declarator: outer.capture }, ...outer.elements].flatMap(element => element === leaf ? inner
      : [plan.array.assignment
        ? expressionStatement(assignmentExpression('=', element.declarator.id, element.declarator.init))
        : variableDeclaration(kind, [element.declarator])]);
  }
  function extract(extraction, receiver) {
    let value = read(extraction, receiver);
    if (extraction.defaultNode) {
      const memo = identifier(mintDeclaredRef());
      value = renderInstanceDefaultGuard({
        assignedRef: memo,
        call: value,
        reread: memo,
        defaultValue: embed(extraction.defaultNode),
        defaultName: extraction.localName,
      });
    }
    return decorate(
      plan.array.assignment
        ? expressionStatement(assignmentExpression('=', embed(extraction.targetNode), value))
        : plan.array.joinResidual ? variableDeclarator(embed(extraction.targetNode), value)
          : variableDeclaration(kind, [variableDeclarator(embed(extraction.targetNode), value)]),
      extraction.prop,
      extraction.localName === plan.array.inlineExport,
    );
  }
  if (plan.array.nativeStatic) {
    const native = renderStaticSentinelPattern(plan.pattern, mintUnused);
    return [
      variableDeclaration(kind, [variableDeclarator(embed(native), embed(init))]),
      ...plan.extractions.map(extraction => extract(extraction, null)),
    ];
  }
  if (plan.array.capture) {
    const captured = renderArrayWrapperCapture(plan.array.capture, { mintRef, embed, retain });
    if (plan.array.normalize) {
      return [captured.capture, ...captured.elements.map(element => element.declarator).filter(Boolean)].map(
        declarator => plan.array.assignment
          ? expressionStatement(assignmentExpression('=', declarator.id, declarator.init))
          : variableDeclaration(kind, [declarator]),
      );
    }
    const plannedElements = new Map(plan.array.elements.map(element => [element.sourceNode ?? element.node, element]));
    const capture = plan.array.assignment
      ? expressionStatement(assignmentExpression('=', captured.capture.id, captured.capture.init))
      : variableDeclaration(kind, [captured.capture]);
    return [
      capture,
      ...captured.elements.flatMap(element => {
        const planned = plannedElements.get(element.pattern);
        if (planned.retained) {
          const ref = identifier(element.ref);
          const rendered = renderRetainedObjectCapture(
            {
              ...planned.retained,
              init: ref,
              receiverRef: element.ref,
              // Iteration already evaluated this source, including its prefix and stores.
              reuseReceiver: false,
              restEffects: [],
              restSource: planned.retained.restSource ? ref : null,
            },
            {
              mintRef,
              mintDeclaredRef,
              mintUnused,
              injectImport,
              embed,
              entry: planned.extraction.entry,
              hintName: planned.extraction.hint,
            },
          );
          return rendered.expression ? [expressionStatement(rendered.expression)]
            : rendered.declarations.map(declarator => variableDeclaration(kind, [declarator]));
        }
        if (planned.kind === 'verbatim') return !element.declarator ? [] : [
          plan.array.assignment
          ? expressionStatement(assignmentExpression('=', element.declarator.id, element.declarator.init))
          : variableDeclaration(kind, [element.declarator]),
        ];
        const groups = [];
        for (const child of planned.children) {
          if (plan.array.positional && child.kind === 'verbatim'
            && groups.at(-1)?.kind === 'verbatim') groups.at(-1).props.push(child.prop);
          else groups.push(child.kind === 'verbatim' ? { ...child, props: [child.prop] } : child);
        }
        function renderLeaf(receiver, children = groups) {
          return children.flatMap(child => {
            // a kept leaf MOVES off the replaced source: it re-dispatches against a minted ref, and
            // only its own node still holds the receiver type the source answered
            if (child.kind === 'verbatim') return [plan.array.assignment
              ? expressionStatement(assignmentExpression('=', objectPattern((child.props ?? [child.prop]).map(retain)), receiver))
              : variableDeclaration(kind, [variableDeclarator(objectPattern((child.props ?? [child.prop]).map(retain)), receiver)])];
            if (child.keyedCapture) {
              // An identifier here is this render's element capture or immutable import.
              // A nested navigation still needs one GetValue before the computed key.
              const keyed = renderNestedKeyedPatternCapture({ ...child.keyedCapture, init: receiver }, {
                mintRef, embed, receiverRef: receiver?.name,
              });
              const fragments = [{ declarator: keyed.capture }, ...keyed.elements];
              return fragments.flatMap(fragment => {
                if (fragment.pattern === child.keyedCapture.leafPattern) {
                  return renderLeaf(identifier(fragment.ref), child.children);
                }
                return [plan.array.assignment
                  ? expressionStatement(assignmentExpression('=', fragment.declarator.id, fragment.declarator.init))
                  : variableDeclaration(kind, [fragment.declarator])];
              });
            }
            const reads = child.extractions.map(extraction => extract(extraction, extraction.kind === 'static' ? null : child.nested
              ? child.nestedKeys.reduce(memberFromKeyName, receiver) : receiver));
            if (child.nativeStatic) {
              const native = renderStaticSentinelPattern(objectPattern([child.prop]), mintUnused);
              reads.unshift(variableDeclaration(kind, [variableDeclarator(embed(native), receiver)]));
            } else if ((plan.array.capturedStatic || plan.array.capturedKey) && child.sentinel) {
              const sentinel = objectProperty(embed(child.prop.key), identifier(mintUnused()), { computed: child.prop.computed });
              reads.unshift(variableDeclaration(kind, [variableDeclarator(objectPattern([sentinel]), receiver)]));
            }
            return reads;
          });
        }
        if (planned.positional) {
          if (planned.anchorPure) return renderLeaf(identifier(injectImport(planned.anchorPure.entry, planned.anchorPure.hintName)));
          const rendered = renderPositionalDestructurePlan(planned, { kind, refName: element.ref, mintRef, embed, renderLeaf });
          return [...rendered.leading, ...rendered.body, ...rendered.trailing];
        }
        let receiver = element.ref ? (planned.nestedKeys ?? []).reduce(memberFromKeyName, identifier(element.ref)) : null;
        const leading = [];
        // Element identifiers are already captured or proved reusable by the source plan.
        // Only a shared member hop needs another capture before its child reads.
        if (planned.nested && planned.children.length > 1 && receiver?.type !== 'Identifier') {
          const ref = identifier(mintRef());
          leading.push(variableDeclaration(kind, [variableDeclarator(ref, receiver)]));
          receiver = ref;
        }
        return [...leading, ...renderLeaf(receiver)];
      }),
    ];
  }
  const refs = new Map();
  const memos = plan.array.memos.map(receiver => {
    const ref = identifier(mintRef());
    refs.set(receiver, ref);
    return variableDeclaration(plan.array.inDeclaration ? kind : 'const', [variableDeclarator(ref, embed(receiver))]);
  });
  const extracted = plan.extractions.map(extraction => extract(
    extraction,
    extraction.kind === 'static' ? null : refs.get(extraction.receiver) ?? embed(extraction.receiver),
  ));
  const leading = plan.array.leading.map(node => expressionStatement(embed(node)));
  if (plan.array.dropsResidual) return [
    ...leading,
    ...plan.array.discarded.map(node => expressionStatement(embed(node))),
    ...memos,
    ...extracted,
  ];
  const residualInit = cloneNode(plan.array.liftedInit ?? init);
  unwrapRuntimeExpr(residualInit).elements = plan.array.initElements.map(node => refs.get(node) ?? cloneNode(node));
  const residualPattern = { ...plan.array.residualPattern, elements: [...plan.array.residualPattern.elements] };
  for (const element of plan.array.elements) {
    const sentinels = element.children?.filter(child => child.sentinel).map(child => child.prop);
    if (!sentinels?.length) continue;
    let pattern = residualPattern.elements[element.index];
    const levels = element.staticLevels ?? [];
    for (let index = levels.length - 1; index >= 0; index--) pattern = pattern.properties[0].value;
    pattern = {
      ...pattern,
      properties: pattern.properties.map(prop => sentinels.includes(prop)
        ? { ...prop, value: identifier(mintUnused()), shorthand: false } : prop),
    };
    for (const level of levels) pattern = { ...level.pattern, properties: [{ ...level.prop, value: pattern }] };
    residualPattern.elements[element.index] = pattern;
  }
  const residual = variableDeclarator(embed(residualPattern), embed(residualInit));
  if (plan.array.joinResidual) {
    const { before, after, exported } = plan.array.joinResidual;
    return [
      ...before.length ? [decorate(variableDeclaration(kind, before.map(retain)), null, exported)] : [],
      ...leading,
      ...memos,
      decorate(variableDeclaration(kind, [
        ...plan.array.after ? [residual, ...extracted] : [...extracted, residual],
        ...after.map(retain),
      ]), null, exported),
    ];
  }
  const declaration = variableDeclaration(kind, [residual]);
  return [...leading, ...memos, ...plan.array.after ? [declaration, ...extracted] : [...extracted, declaration]];
}

// the constructor a keyed capture's LEAF ref holds, as `{ ref, ctorName }`, or null: a proven static
// claim read off the leaf level names its receiver, and the null-check the render may put around an
// outer key must not hide it from the re-detected leaf. `rendered` is the capture render's result.
// a capture of a SELECTION (`cnd && { Array }`, also through the ref an array capture bound to its
// element) or through an inner default binds whichever arm ran, and the claim names one arm only: its
// leaf ref names no constructor there. `ctx` is the host's `{ scope, adapter, path }`
export function capturedLeafCtorAlias({ capture, rendered, leafPattern, kind, meta, ctx }) {
  if (kind !== 'static' || meta?.placement !== 'static' || !meta.object || meta.guardedAliasHint
    || (meta.chainAssignInsertAt !== null && meta.chainAssignInsertAt !== undefined)) return null;
  let value = capture.init;
  const binding = value?.type === 'Identifier' ? ctx.adapter?.getBinding?.(ctx.scope, value.name, ctx.path) : null;
  if (binding) value = patternBoundAliasSlotInit(binding, value.name, ctx) ?? value;
  if (capture.ancestors?.some(level => level.defaultValue) || flattenBranchingValueNodes([value]).length > 1) return null;
  const ref = rendered.elements.find(element => element.pattern === leafPattern)?.ref;
  return typeof ref === 'string' ? { ref, ctorName: meta.object } : null;
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
  receiverRef = null,
  embed = node => node,
  narrow = null,
  split = null,
  injectImport = null,
  assignment = false,
  preserveResult = false,
  anchorPure = null,
  renderLeaf = null,
  coerceLeaf = false,
  noteRefAlias = null,
}) {
  markCapturedKeyedPattern(plan.leafPattern);
  const inlineLeaf = plan.inlineLeaf && assignment && renderLeaf && !narrow && !anchorPure;
  const ref = coerceLeaf || inlineLeaf ? null : mintRef();
  let captured = coerceLeaf || inlineLeaf ? objectPattern([]) : identifier(ref);
  for (const level of plan.ancestors.toReversed()) {
    captured = { ...level.pattern, properties: [
      { ...level.prop, value: level.defaultValue ? { ...level.defaultValue, left: captured } : captured },
    ] };
  }
  const elements = (inlineLeaf ? [] : narrow ? plan.leafPattern.properties : [plan.leaf]).map((leaf, index) => {
    const value = narrow ? renderCtorIdentityNarrow(split?.[index].plan ?? narrow,
      memberExpression(identifier(ref), identifier(leaf.key.name ?? leaf.key.value)), {
        injectImport,
        spellRecv: () => identifier(ref),
      }) : ref ? identifier(ref) : voidZero();
    return {
      pattern: plan.leafPattern,
      ref,
      guarded: !!narrow,
      declarator: variableDeclarator(embed(narrow ? leaf.value : plan.leafPattern), value),
    };
  });
  const { splitCapture } = plan;
  if (splitCapture) {
    let receiver = ref ?? objectPattern([]);
    for (const [index, level] of plan.ancestors.entries().toArray().toReversed()) {
      // A native sole-key capture already evaluates an allocated wrapper before its key.
      // Its allocation cannot yield null, so storing that wrapper adds no ordering guard.
      const root = unwrapRuntimeExpr(plan.init);
      if (index === 0 && level.pattern.properties.length === 1 && !preserveResult && !inlineLeaf
        && (root?.type === 'ObjectExpression' || root?.type === 'ArrayExpression')) {
        receiver = {
          ...level.pattern,
          properties: [
            {
              ...level.prop,
              value: level.defaultValue
          ? { ...level.defaultValue, left: typeof receiver === 'string' ? identifier(receiver) : receiver }
          : typeof receiver === 'string' ? identifier(receiver) : receiver,
            },
          ],
        };
        break;
      }
      const outer = !assignment && index === 0 && receiverRef ? receiverRef : mintRef();
      if (plan.levelNames?.[index]) noteRefAlias?.(outer, plan.levelNames[index]);
      const ordered = [];
      // ... and the level holding the init rejects nothing a proven init can never be
      let receiverCoerced = index === 0
        && keyedReadReceiverProven({ init: plan.init, hostPath: plan.ctx?.path, adapter: plan.ctx?.adapter });
      for (const prop of level.pattern.properties) {
        const source = prop === level.prop ? {
          ...prop,
          value: level.defaultValue
          ? { ...level.defaultValue, left: typeof receiver === 'string' ? identifier(receiver) : receiver }
          : typeof receiver === 'string' ? identifier(receiver) : receiver,
        } : prop;
        // A later lowering may evaluate the first key before rejecting null. A preceding native
        // pattern already rejected it, so subsequent keys need no initializer guard.
        const init = !receiverCoerced && computedKeyHasSideEffects(prop, plan.ctx)
          ? conditionalExpression(nullFirstGuardTest(identifier(outer)),
            memberExpression(identifier(outer), valueLiteral(''), { computed: true }), identifier(outer)) : identifier(outer);
        if (inlineLeaf && index === plan.ancestors.length - 1 && prop === level.prop) {
          ordered.push({ expression: renderLeaf(memberExpression(init, embed(prop.key), { computed: prop.computed })) });
        } else ordered.push({ declarator: variableDeclarator(embed({ ...level.pattern, properties: [source] }), init) });
        receiverCoerced = true;
        if (prop === level.prop) ordered.push(...elements);
      }
      elements.splice(0, elements.length, ...ordered);
      receiver = outer;
    }
    captured = typeof receiver === 'string' ? identifier(receiver) : receiver;
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
        renderLeaf ? renderLeaf(anchorNode) : assignmentExpression('=', embed(plan.leafPattern), anchorNode),
        result,
      ]) };
    }
    const capture = assignmentExpression('=', embed(captured), anchorNode ?? embed(plan.init));
    const result = preserveResult ? splitCapture ? captured : identifier(mintRef()) : null;
    return {
      elements,
      expression: sequenceExpression([
        result && !splitCapture ? assignmentExpression('=', result, capture) : capture,
        ...elements.map(({ declarator, expression, pattern: elementPattern }) => expression
        ?? (renderLeaf && elementPattern === plan.leafPattern ? renderLeaf(ref ? identifier(ref) : null)
          : assignmentExpression('=', declarator.id, declarator.init))),
        ...result ? [result] : [],
      ]),
    };
  }
  return {
    capture: splitCapture && receiverRef ? elements.shift().declarator
      : variableDeclarator(embed(captured), anchorNode ?? embed(plan.init)),
    elements,
  };
}

// the constructor or realm a receiver node names: a proxy-global member, a bound name, or a
// container slot the static canon reads
function receiverCtorName(receiver, { scope, adapter, path }) {
  return globalProxyMemberName({ node: receiver, scope, adapter, path })
    ?? resolveObjectName({ objectNode: receiver, scope, adapter, path })
    ?? staticContainerReceiverName({ node: receiver, scope, adapter, path });
}

// Retain a default receiver before reading its properties in source order. Only sole outer
// pattern chains can move as one unit; body hosts keep activation-local captures. Parameters
// need the existing closed caller census and may not expose moved bindings to another parameter.
// eslint-disable-next-line max-statements -- retained-default admission across native source, caller, catch and loop scopes
function planRetainedDefaultCapture({ propPath, meta, adapter, resolvePure, parameterCallSites, isDisabledProp = null }) {
  const host = destructurePatternHostPath(propPath);
  let wrapper = propPath.parentPath;
  while (wrapper?.node && wrapper.node.type !== 'AssignmentPattern') {
    if (!PATTERN_CHAIN_TYPES.has(wrapper.node.type)) {
      if (wrapper.node !== host?.node || !host.node.params || meta.placement !== 'static') return null;
      wrapper = null;
      break;
    }
    wrapper = wrapper.parentPath;
  }
  const supplied = !wrapper;
  let patternPath = supplied ? host.get('params')[0] : wrapper.get('left');
  if (patternPath.node.type !== 'ObjectPattern' && patternPath.node.type !== 'ArrayPattern') return null;
  let pattern = patternPath.node;
  const ctx = { scope: propPath.scope, adapter, path: propPath };
  let retainsReads = patternKeepsEffectfulKey(pattern, ctx);
  // Repeated native siblings can belong to an ancestor of the claimed leaf. Each
  // level keeps its own reads; a literal mirror would merge those repeated slots.
  for (let level = propPath.parentPath; level?.node; level = level.parentPath) {
    if (level.node.type === 'ObjectPattern') {
      const slots = level.node.properties.map(prop => synthPropDedupKey(prop, ctx));
      if (level.node.properties.some(isRestProperty) || slots.some(slot => slot === null)) return null;
      retainsReads ||= new Set(slots).size !== slots.length;
    }
    if (level.node === pattern) break;
  }
  if (!retainsReads) return null;
  const arrayWrappers = [];
  let top = wrapper ?? patternPath;
  for (let parent = top.parentPath; parent?.node; parent = top.parentPath) {
    if (parent.node.type === 'ArrayPattern' && parent.node.elements.length === 1 && parent.node.elements[0] === top.node) {
      arrayWrappers.push(parent);
      top = parent;
    } else if (isPropertyNode(parent.node) && parent.node.value === top.node
      && parent.parentPath?.node?.properties?.length === 1) top = parent.parentPath;
    else break;
  }
  let site = host;
  const root = top.node;
  let body = null;
  let assignment = false;
  let kind = 'let';
  let receiverSources = null;
  let receiverCallers = null;
  switch (host?.node?.type) {
    case 'VariableDeclarator':
      if (host.node.id !== root) return null;
      kind = host.parentPath.node.kind;
      if (host.node.init) {
        receiverSources = [host.node.init];
        const placement = classifyVariableDeclarationHost({
          declaration: host.parentPath.node,
          declarationParent: host.parentPath.parentPath?.node,
        });
        if (placement.isForInit || placement.isBodyless) return null;
      } else {
        site = host.parentPath.parentPath;
        if (site?.node?.type !== 'ForOfStatement' || site.node.left !== host.parentPath.node) return null;
        receiverSources = forOfHeadIterableElements(host);
        const names = [];
        walkPatternIdentifiers(root, id => names.push(id.name));
        if (kind !== 'var' && names.some(name => paramListReadsName([site.node.right], name))) return null;
        body = site.node.body;
      }
      break;

    case 'AssignmentExpression':
      if (host.node.left !== root) return null;
      assignment = true;
      receiverSources = [host.node.right];
      break;

    case 'CatchClause':
      if (host.node.param !== root) return null;
      // A sole quiet throw has no other value-producing execution that can reach this catch.
      // General catches remain opaque; their iterators must close around the original reads.
      if (arrayWrappers.length) {
        const block = host.parentPath?.get('block');
        const thrown = block?.get('body')?.[0];
        if (block?.node?.body.length !== 1 || thrown?.node?.type !== 'ThrowStatement'
          || throwCatchHandler(thrown)?.node !== host.node || mayHaveSideEffects(thrown.node.argument, ctx)) return null;
        receiverSources = [thrown.node.argument];
      }
      body = host.node.body;
      break;

    default: if (host?.node?.params?.includes(root)) {
      if (host.node.params.length !== 1 || referencesArgumentsObject(host.node)) return null;
      const callers = parameterCallSites?.(top, { staticIsMutated: adapter.isMutatedStatic });
      if (!callers?.length || callers.some(({ pairing, callPath, argIndex }) => {
        if (pairing.argsUnknown) return true;
        if (root.type === 'AssignmentPattern') return argumentOverridesSlot(pairing.args ?? [], argIndex,
          () => adapter.hasBinding(callPath.scope, 'undefined', callPath));
        const argument = resolveCallArgument(pairing.args ?? [], argIndex);
        return !argument || !supplied && !patternSlotCertainDefault(root, argument, wrapper.node,
          { scope: callPath.scope, adapter, path: callPath });
      })) return null;
      if (callers.some(({ callPath }) => !bodyRunsAtInvocation(host.node, callPath.node))) return null;
      receiverCallers = callers;
      if (arrayWrappers.length) receiverSources = callers.map(({ pairing, argIndex }) => resolveCallArgument(pairing.args ?? [], argIndex));
      if (supplied) {
        receiverSources = callers.map(({ pairing, argIndex }) => resolveCallArgument(pairing.args ?? [], argIndex));
      }
      const names = [];
      walkPatternIdentifiers(root, id => names.push(id.name));
      if (names.some(name => paramListReadsName(host.node.params, name) || functionScopeBindsVarOrFunction(host, name))) return null;
      body = host.node.body;
    } else return null;
  }
  // Singleton reads after an array capture would otherwise run after IteratorClose. Born
  // literals use the pristine array iterator; opaque/user iterators keep the native pattern.
  if (arrayWrappers.length && (arrayWrappers.length !== 1 || arrayWrappers[0].node !== root
    || adapter.isMutatedStatic?.('Array.prototype', 'Symbol.iterator') || !receiverSources?.length
    || receiverSources.some(source => unwrapRuntimeExpr(installedWriteValue(source))?.type !== 'ArrayExpression'))) return null;
  // Parameters stay in their existing body boundary; catch/loop captures recreate the head
  // scope around the original body block, so its lexical bindings remain nested inside it.
  const preserveBodyScope = !!body && !host.node.params;
  if (body && !preserveBodyScope) {
    let bodyBindings = false;
    walkAstNodes({
      root: body,
      visit(node) {
        bodyBindings ||= node.type === 'VariableDeclaration'
        || node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration';
      },
    });
    if (bodyBindings) return null;
  }
  const mirrorOptions = {
    leafPatternPath: propPath.parentPath,
    meta,
    adapter,
    resolvePure,
    parameterCallSites,
    isDisabledProp,
    retainNativeReads: true,
  };
  const mirror = supplied ? buildParameterArgumentSynthPlan(mirrorOptions) : buildNestedParamSynthPlan(mirrorOptions);
  const defaultNodes = new Set();
  for (const source of supplied ? receiverSources : [wrapper.node.right]) {
    walkAstNodes({ root: source, visit: node => { defaultNodes.add(node); } });
  }
  const patternNodes = new Set();
  walkAstNodes({ root: pattern, visit: node => { patternNodes.add(node); } });
  const targets = mirror?.targets?.filter(item => defaultNodes.has(item.node) && patternNodes.has(item.pattern)
    && item.tree.kind === 'object' && item.claimedProperties.includes(propPath.node)) ?? [];
  const target = supplied ? mirror?.claimedProperties?.includes(propPath.node) && targets.length
    && targets.every(item => item.pattern === targets[0].pattern) ? targets[0] : null
    : targets.length === 1 ? targets[0] : null;
  if (supplied && !target) return null;
  // A default can select a foreign receiver. Only the source-wide claim proof lets its
  // activation flag authorize a pure read; partial selections keep their mirror branches.
  if (target && !mirror.claimedProperties.includes(propPath.node)) return null;
  // Claim-only parameter mirrors already leave key effects inside the native pattern.
  // Moving them into the body would close an enclosing iterator before those effects.
  if (body && target && !target.readProperties.length) return null;
  if (supplied && targets.some(item => item.staticBindings.size !== target.staticBindings.size
    || [...target.staticBindings].some(([prop, entry]) => item.staticBindings.get(prop) !== entry))) return null;
  const source = assignment ? host.node.right : host.node.init;
  let entries;
  if (target) {
    pattern = target.pattern;
    entries = target.tree.entries;
  } else {
    // The ordinary instance capture already owns a live/default receiver join. This
    // specialization only replaces it when the native caller/source leaves the slot empty.
    if (!host.node.params && !patternSlotCertainDefault(root, source, wrapper.node, ctx)) return null;
    patternPath = propPath.parentPath;
    pattern = patternPath.node;
    entries = patternPath.get('properties').map(item => {
      if (isDisabledProp?.(item.node)) return null;
      const leaf = destructurePropLeafMeta({
        prop: item.node,
        objectPattern: patternPath,
        scope: item.scope,
        path: item,
        adapter,
        resolvePure,
      }).meta;
      const pure = leaf && (isSourcedSymbolIteratorMeta(leaf) ? SYMBOL_ITERATOR_PURE_RESULT : resolvePure(leaf, item));
      return {
        slot: synthPropDedupKey(item.node, ctx),
        prop: item.node,
        symbolKey: leaf && isSourcedSymbolIteratorMeta(leaf)
          ? resolvePure({ kind: 'property', object: 'Symbol', key: 'iterator', placement: 'static' }) : null,
        instance: pure?.kind === 'instance' ? pure : null,
        child: { kind: 'passthrough' },
      };
    });
    if (entries.some(entry => !entry) || entries.every(entry => !entry.instance)) return null;
  }
  // A capture under a literal spine leaves no later sibling bindings ahead of its reads.
  // Each array on that spine must use a born literal's pristine iterator.
  const levels = [];
  let capturePath = propPath.parentPath;
  while (capturePath.node !== pattern) capturePath = capturePath.parentPath;
  for (let parent = capturePath.parentPath; capturePath.node !== (wrapper?.node.left ?? root); parent = capturePath.parentPath) {
    if (isPropertyNode(parent?.node) && parent.node.value === capturePath.node
      && parent.parentPath?.node.properties?.length === 1) {
      const key = resolveKey({ node: parent.node.key, computed: parent.node.computed, ...ctx, keepsKeyNode: true });
      if (key === null) return null;
      levels.unshift({ key, array: false });
      capturePath = parent.parentPath;
    } else if (parent?.node.type === 'ArrayPattern' && parent.node.elements.length === 1
      && parent.node.elements[0] === capturePath.node) {
      levels.unshift({ key: '0', array: true });
      capturePath = parent;
    } else return null;
  }
  const pairedSources = new Map();
  let activeArray = arrayWrappers.length && receiverSources.some(item => unwrapRuntimeExpr(installedWriteValue(item)).elements.length);
  for (const sourceNode of supplied ? receiverSources : [wrapper.node.right]) {
    let pairedSource = sourceNode;
    for (const level of levels) {
      pairedSource = unwrapRuntimeExpr(installedWriteValue(pairedSource));
      if (level.array) {
        if (pairedSource?.type !== 'ArrayExpression' || adapter.isMutatedStatic?.('Array.prototype', 'Symbol.iterator')) return null;
        activeArray ||= !!pairedSource.elements.length;
        pairedSource = arrayLiteralSlotValue(pairedSource, level.key);
      } else pairedSource = objectLevelPairedProperty(pairedSource, level.key)?.read;
      if (!pairedSource) return null;
    }
    pairedSources.set(unwrapRuntimeExpr(sourceNode), pairedSource);
  }
  // A live array iterator must close after the retained key/read effects. Only local
  // intrinsic array appends with primitive values can run while a capture moves that close.
  let retainedHead = false;
  if (activeArray) {
    const movesIterator = (() => {
      if (adapter.isWrittenContainerSlot?.('', ['return'])
        || [...adapter.mutatedStatics ?? []].some(key => key.startsWith('Array.prototype.')
          || key.startsWith('Object.prototype.'))) return null;
      const calls = [];
      let unsafe = false;
      walkAstNodes({
        root: pattern,
        visit(node, parent) {
          if (FUNCTION_LIKE_NODE_TYPES.has(parent?.type) && (parent.body === node || parent.params?.includes(node))) return false;
          if (node.type === 'CallExpression' && !node.optional) calls.push(node);
          else if (node.type === 'OptionalCallExpression' || node.type === 'NewExpression' || node.type === 'AssignmentExpression'
          || node.type === 'CallExpression' && node.optional
          || node.type === 'UpdateExpression' || node.type === 'AwaitExpression' || node.type === 'YieldExpression'
          || node.type === 'UnaryExpression' && node.operator === 'delete'
          || isMemberAccessNode(node) && parent?.callee !== node && mayHaveSideEffects(node, ctx)) unsafe = true;
        },
      });
      if (unsafe) return null;
      const checked = new Set();
      for (const call of calls) {
        const callee = unwrapRuntimeExpr(call.callee);
        const imported = callee?.type === 'Identifier' && adapter.getBinding(ctx.scope, callee.name, propPath);
        const purePush = imported && !imported.constantViolations?.length
          && pureImportSourceEntry(imported.importSource) === 'array/instance/push';
        const object = purePush ? call.arguments[0] : callee?.object;
        const argumentsList = purePush ? call.arguments.slice(1) : call.arguments;
        const name = purePush ? 'push' : isMemberAccessNode(callee) && !callee.optional
          && resolveKey({ node: callee.property, computed: callee.computed, ...ctx });
        if (name !== 'push' || object?.type !== 'Identifier'
          || argumentsList.some(arg => !isQuietLiteralOperand(arg) || arg.type === 'RegExpLiteral' || arg.regex)
          || prototypeChainMayLend(name, ctx, ['Array', 'Object'])) return null;
        const binding = adapter.getBinding(ctx.scope, object.name, propPath);
        const born = binding?.node?.init;
        if (binding?.kind !== 'const' || binding.constantViolations?.length || born?.type !== 'ArrayExpression'
          || born.elements.some(item => !item || !isQuietLiteralOperand(item) || item.type === 'RegExpLiteral' || item.regex)) return null;
        if (checked.has(binding.node)) continue;
        const refs = adapter.collectBindingReferences?.(propPath, object.name, { closed: true });
        if (!refs) return null;
        for (const ref of refs) {
          const member = ref.parentPath;
          if (isMemberAccessNode(member?.node) && member.node.object === ref.node && isMemberWriteHost(member)) return null;
          const frame = findNearestVarScopeOwner(ref);
          if (member?.node.type !== 'ExportSpecifier' && receiverCallers?.length
            && !readRunsDeferredWithin(ref, frame?.node)
            && receiverCallers.every(({ callPath }) => {
              let invocation = callPath;
              for (let owner = findNearestVarScopeOwner(invocation); owner?.node !== frame?.node;
                owner = findNearestVarScopeOwner(invocation)) {
                if (!owner?.node.params) return false;
                invocation = runsAtImmediateInvocation(owner);
                if (!invocation) return false;
              }
              return provablyPrecedes(invocation.node, ref.node) && noReassignmentReachesUsage({
                reassignmentNodes: [ref.node],
                usagePath: invocation,
                bindingScopeNode: frame.node,
              });
            }) && !subtreeContainsNode(pattern, ref.node)) continue;
          if (!isMemberAccessNode(member?.node) || member.node.object !== ref.node) return null;
          const key = resolveKey({ node: member.node.property, computed: member.node.computed, scope: ref.scope, adapter, path: ref });
          const invoked = member.parentPath?.node;
          if (key === 'length' && invoked?.callee !== member.node) continue;
          const actualCallee = unwrapRuntimeExpr(invoked?.callee);
          const dispatch = isMemberAccessNode(actualCallee) && !actualCallee.computed && actualCallee.property.name === 'call'
            && actualCallee.object.type === 'CallExpression' ? actualCallee.object : null;
          const importedCallee = dispatch?.callee ?? actualCallee;
          const calledName = importedCallee?.type === 'Identifier'
            && adapter.getBinding(ref.scope, importedCallee.name, ref);
          const sourced = calledName && !calledName.constantViolations?.length
            && pureImportSourceEntry(calledName.importSource) === `array/instance/${ key }`
            && invoked.arguments[0]?.type === 'Identifier' && invoked.arguments[0].name === object.name
            && (!dispatch || dispatch.arguments.length === 1 && dispatch.arguments[0].type === 'Identifier'
              && dispatch.arguments[0].name === object.name && !prototypeChainMayLend('call', ctx, ['Function', 'Object']));
          const args = sourced ? invoked.arguments.slice(1) : invoked?.arguments;
          if ((key !== 'push' && key !== 'join') || invoked?.type !== 'CallExpression' || !sourced && invoked.callee !== member.node
            || args.some(arg => !isQuietLiteralOperand(arg) || arg.type === 'RegExpLiteral' || arg.regex)
            || prototypeChainMayLend(key, ctx, ['Array', 'Object'])) return null;
        }
        checked.add(binding.node);
      }
      return true;
    })();
    if (!movesIterator) {
      // Closed static callers can keep every native head read and rebind the proven
      // statics after iteration. A claimed leaf default would run too early when stripped.
      if (!host.node.params || !target || !target.staticBindings.size
        || target.staticBindings.size !== target.claimedProperties.length
        || target.staticBindings.keys().some(prop => !mirror.claimedProperties.includes(prop)
          || unwrapRuntimeExpr(prop.value)?.type !== 'Identifier')) return null;
      retainedHead = true;
    }
  }
  if (supplied && !parameterStaticSource(receiverCallers, null, (value, { callPath }) => {
    const name = receiverCtorName(peelNestedSequenceExpressions(pairedSources.get(value)).tail,
      { scope: callPath.scope, adapter, path: callPath });
    return name === meta.object || isPristineProxyGlobal(adapter, name) ? name : null;
  })) return null;
  return {
    host,
    site,
    root,
    wrapper: wrapper?.node,
    supplied,
    pattern,
    entries,
    target,
    assignment,
    kind,
    body,
    ctx,
    retainedHead,
    preserveBodyScope,
    expressionBody: !!host.node.params && body?.type !== 'BlockStatement',
  };
}

// Split a default's reads into native one-property patterns. Claimed singleton mirrors run
// in the property's own slot, guarded by the captured default arm; supplied objects retain
// their getters and defaults. Native passthrough reads always use the captured receiver.
function renderRetainedDefaultCapture(plan, {
  mintRef,
  mintDeclaredRef = mintRef,
  injectImport,
  resolveGlobalPolyfill,
  adapter,
  embed = node => node,
  sourceExpression = node => node,
  claimProperties = null,
}) {
  if (plan.retainedHead) {
    const statements = plan.target.staticBindings.entries().map(([prop, entry]) => expressionStatement(assignmentExpression('=',
      embed(prop.value), identifier(injectImport(entry, propBindingIdentifier(prop.value).name))))).toArray();
    // The claims are spent; the original property keys still run in the native head.
    claimProperties?.(plan.target.staticBindings.keys().toArray(), false);
    return { statements };
  }
  const flagName = plan.supplied ? null : (plan.assignment ? mintDeclaredRef : mintRef)();
  const receiverName = (plan.assignment ? mintDeclaredRef : mintRef)();
  function flag() {
    return flagName ? identifier(flagName) : valueLiteral(true);
  }
  function receiver() {
    return identifier(receiverName);
  }
  const synthContext = {
    ...plan.target,
    ...plan.target?.memo || plan.supplied ? { receiverName, receiverIsProxy: false } : {},
    injectImport,
    resolveGlobalPolyfill,
    adapter,
  };
  function capturePattern(node) {
    if (node === plan.pattern) return receiver();
    if (node === plan.wrapper) return {
      ...node,
      left: capturePattern(node.left),
      right: sourceExpression(sequenceExpression([assignmentExpression('=', flag(), valueLiteral(true)), embed(node.right)])),
    };
    if (node.type === 'ArrayPattern') return { ...node, elements: node.elements.map(capturePattern) };
    if (node.type === 'ObjectPattern') return {
      ...node,
      properties: node.properties.map(prop => ({ ...prop, value: capturePattern(prop.value) })),
    };
    return node;
  }
  const mutable = flagName ? [variableDeclarator(flag(), valueLiteral(false))] : [];
  const declarations = [];
  const assignments = [];
  function consume(pattern, ref, entries, keyPath = []) {
    const coerce = objectPattern([]);
    if (plan.assignment) assignments.push(assignmentExpression('=', coerce, ref()));
    else declarations.push(variableDeclarator(coerce, ref()));
    for (const prop of pattern.properties) {
      const slot = synthPropDedupKey(prop, plan.ctx);
      const entry = entries.find(item => item.slot === slot || item.prop === prop
        || (item.prop && synthPropDedupKey(item.prop, plan.ctx) === slot)
        || item.key === resolveKey({ node: prop.key, computed: prop.computed, ...plan.ctx, keepsKeyNode: true }));
      if (!entry) return false;
      let source = ref();
      let targetProp = prop;
      let keyEffects = [];
      if (entry.instance) {
        const read = callExpression(identifier(injectImport(entry.instance.entry, entry.instance.hintName)), [ref()]);
        // The source key stays in the native pattern; the literal carries only its stable spelling.
        const literalKey = resolveKey({ node: prop.key, computed: prop.computed, ...plan.ctx, keepsKeyNode: true });
        const stableKey = entry.symbolKey
          ? identifier(injectImport(entry.symbolKey.entry, entry.symbolKey.hintName)) : valueLiteral(literalKey);
        if (prop.computed && computedKeyHasSideEffects(prop, plan.ctx)) {
          const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
          keyEffects = observableSequenceElements([...prefix, tail], plan.ctx).map(embed);
          targetProp = { ...prop, key: sourceExpression(stableKey) };
        }
        const pureObject = entry.instance.entry === 'get-iterator-method'
          ? objectExpression([objectProperty(stableKey, read, { computed: true })])
          : objectExpression([objectProperty(valueLiteral(literalKey), read)]);
        source = plan.supplied ? pureObject : conditionalExpression(flag(), pureObject, ref());
        claimProperties?.([prop, targetProp], false);
      } else if (entry.child.kind === 'object' && (prop.value?.type === 'ObjectPattern')) {
        const innerName = (plan.assignment ? mintDeclaredRef : mintRef)();
        function inner() {
          return identifier(innerName);
        }
        const pureValue = renderSynthTree({ kind: 'passthrough' }, synthContext, [...keyPath, entry.key]);
        const mirrored = objectExpression([objectProperty(valueLiteral(entry.key), pureValue)]);
        const value = plan.supplied ? mirrored : conditionalExpression(flag(), mirrored, ref());
        const capture = objectPattern([objectProperty(embed(prop.key), inner(), { computed: prop.computed })]);
        if (plan.assignment) assignments.push(assignmentExpression('=', capture, value));
        else declarations.push(variableDeclarator(capture, value));
        if (!consume(prop.value, inner, entry.child.entries, [...keyPath, entry.key])) return false;
        continue;
      } else if (entry.child.kind === 'polyfill' || entry.child.injects || entry.readPure
        || entry.child.kind === 'descended-pattern') {
        if (entry.readPure && prop.computed && computedKeyHasSideEffects(prop, plan.ctx)) {
          const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
          keyEffects = observableSequenceElements([...prefix, tail], plan.ctx).map(embed);
          targetProp = { ...prop, key: sourceExpression(identifier(injectImport(entry.symbolKey.entry, entry.symbolKey.hintName))) };
        }
        const tree = { kind: 'object', entries: [entry] };
        const mirrored = renderSynthTree(tree, synthContext, keyPath);
        source = plan.supplied ? mirrored : conditionalExpression(flag(), mirrored, ref());
        claimProperties?.(plan.target.claimedProperties.filter(item => item === prop || item === entry.child.prop), false);
        if (entry.readPure) claimProperties?.([prop, targetProp], false);
      }
      if (keyEffects.length) source = sequenceExpression([...keyEffects, source]);
      const singleton = embed({ ...pattern, properties: [targetProp] });
      if (plan.assignment) assignments.push(assignmentExpression('=', singleton, source));
      else declarations.push(variableDeclarator(singleton, source));
    }
    return true;
  }
  if (plan.assignment) {
    const resultName = mintDeclaredRef();
    assignments.push(assignmentExpression('=', identifier(resultName), embed(plan.host.node.right)),
      assignmentExpression('=', flag(), valueLiteral(false)),
      assignmentExpression('=', embed(capturePattern(plan.root)), identifier(resultName)));
    if (!consume(plan.pattern, receiver, plan.entries)) return null;
    return { expression: sequenceExpression([...assignments, identifier(resultName)]) };
  }
  const headName = plan.body ? mintRef() : null;
  const defaultValue = plan.root.type === 'AssignmentPattern' ? sequenceExpression([
    assignmentExpression('=', flag(), valueLiteral(true)),
    embed(plan.root.right),
  ]) : null;
  declarations.push(plan.root.type === 'AssignmentPattern'
    ? variableDeclarator(embed(capturePattern(plan.root.left)), conditionalExpression(
      binaryExpression('===', identifier(headName), voidZero()), defaultValue, identifier(headName)))
    : variableDeclarator(embed(capturePattern(plan.root)), plan.body ? identifier(headName) : embed(plan.host.node.init)));
  if (!consume(plan.pattern, receiver, plan.entries)) return null;
  return {
    declarations,
    mutable,
    headName,
    head: plan.body ? plan.root.type === 'AssignmentPattern'
    ? embed({ ...plan.root, left: identifier(headName), right: sourceExpression(voidZero()) }) : identifier(headName) : null,
  };
}

// An effectful key cannot keep a sentinel: that reads its getter twice. Split the level
// into native single-property patterns. Rest only admits pristine static-only captures.
// Nested patterns remain native operands, so their iterator/default effects keep their position.
// A mixed static/instance claim uses the supplied identity planner over the captured receiver.
// Assignment refs in parameters and instance fields receive their own lexical activation
// at the binding's final memo placement.
export function planRetainedObjectCapture(options) {
  if (options.propPath) {
    const defaultCapture = planRetainedDefaultCapture(options);
    return defaultCapture ? { defaultCapture } : null;
  }
  // A prior claim's allocator-owned receiver already belongs to this host's activation.
  // Stable source bindings can also supply the reads, after the original coercion slot.
  const receiver = unwrapRuntimeExpr(options.init);
  const sourceReceiver = receiver?.type === 'SequenceExpression'
    ? unwrapRuntimeExpr(peelNestedSequenceExpressions(receiver).tail) : receiver;
  const sharedSlot = options.hostPath && runsWithoutOwnVarSlot(options.hostPath);
  const receiverRef = !sharedSlot && receiver?.type === 'Identifier'
    && options.injectorState?.isOwnPassGeneratedName?.(receiver.name) ? receiver.name : undefined;
  const plan = planRetainedObjectCaptureShape({ ...options, receiverRef });
  if (!plan) return null;
  const reuseReceiver = !receiverRef && !sharedSlot && sourceReceiver?.type === 'Identifier' && isReReferenceableAcrossReads(sourceReceiver,
    { scope: options.hostPath?.scope, path: options.hostPath, adapter: options.adapter, injectorState: options.injectorState });
  const preserveResult = !options.assignment || !options.hostPath || !assignmentValueDiscarded(options.hostPath);
  // A sole dispatch performs the original receiver read itself. An effectful key can
  // precede only an inert private allocation whose result the host does not expose.
  const keyEffects = options.prop?.computed && computedKeyHasSideEffects(options.prop,
    { scope: options.hostPath?.scope, path: options.hostPath, adapter: options.adapter });
  const inlineReceiver = (!options.assignment || !preserveResult) && options.kind === 'instance' && !plan.narrow
    && !plan.coerceReceiver && plan.pattern?.properties.length === 1 && !plan.rest
    && (!keyEffects || isConstantLiteralReceiver(receiver));
  return {
    ...plan,
    ...receiverRef ? { receiverRef } : {},
    ...reuseReceiver ? { receiverRef: sourceReceiver.name, reuseReceiver: true } : {},
    ...inlineReceiver ? {
      inlineReceiver: true,
      ...isConstantLiteralReceiver(receiver) ? { provenReceiver: true } : {},
    } : {},
    preserveResult,
  };
}

// eslint-disable-next-line max-statements -- ordered capture admission across flat, nested and array hosts
function planRetainedObjectCaptureShape({
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
  receiverRef = undefined,
}) {
  const ctx = { scope: hostPath?.scope, adapter, path: hostPath };
  if (prop && isClaimedProp?.(prop)) return null;
  // The existing identity guard also serves a selecting receiver whose unknown key
  // prevents a mirror. Its original pattern reads each unclaimed property separately.
  const guardedFallback = hostPath && resolvedMeta?.fromFallback && pattern?.properties?.includes(prop)
    && (assignment && !assignmentValueDiscarded(hostPath)
      || kind === 'static' && !patternComputedKeysSynthSafe({
        objectPatternNode: pattern,
        scope: hostPath.scope,
        adapter,
        path: hostPath,
      }));
  const fallbackObjects = guardedFallback ? flattenFallbackBranches({
    node: init,
    key: resolvedMeta.key,
    scope: hostPath.scope,
    adapter,
    path: hostPath,
  }).map(meta => meta.object) : [];
  const guardMeta = fallbackObjects.length ? {
    ...resolvedMeta,
    object: null,
    guardedAliasHint: fallbackObjects[0],
    guardedWriteObjects: fallbackObjects,
    guardOnly: true,
  } : resolvedMeta;
  const guarded = !!guardMeta?.guardedAliasHint && (kind === 'instance' || guardedFallback);
  if (guarded && pattern?.type === 'ObjectPattern' && !pattern.properties.includes(prop)) {
    const capture = planNestedKeyedPatternCapture({ pattern, init, allowArray: true, ctx })
      ?? planNestedKeyedPatternCapture({ pattern, init, force: true, allowArray: true, ctx });
    if (capture && (capture.leafPattern.type === 'ArrayPattern' || capture.leafPattern.properties.includes(prop))) {
      const innerPlan = planRetainedObjectCapture({ pattern: capture.leafPattern, init, assignment, prop,
        hostPath, adapter, resolveNodeType, injectorState, kind, entry, patternPath,
        probedInit, resolvePure, resolveStaticProp, planGuardedNarrow, isClaimedProp, isConsumedProp, meta: resolvedMeta });
      if (innerPlan) return { capture, innerPlan, assignment };
    }
  }
  const arrayReceiver = ownRelocatedHeadElement(hostPath) ?? installedWriteValue(init);
  const arraySource = followConstLiteralAlias(arrayReceiver, { scope: hostPath?.scope, adapter, path: hostPath });
  const keyedElement = computedKeyHasSideEffects(prop, ctx) || kind === 'static' && !!resolvedMeta?.object
    && !resolvedMeta.guardedAliasHint && patternKeepsEffectfulKey(pattern, ctx)
    && !adapter?.isMutatedStatic?.('Array.prototype', 'Symbol.iterator');
  if (pattern?.type === 'ArrayPattern' && (guarded || keyedElement || pattern.elements.length === 1)
    && (guarded || arraySource?.type === 'ArrayExpression' && arraySource.elements.length >= 1)) {
    // a slot of a BOUND literal may have been written since its declaration: only an inline one
    // proves an element default dead
    const capture = planArrayWrapperCapture({
      pattern,
      init: arraySource ?? arrayReceiver,
      force: true,
      ctx: hostPath && arraySource === arrayReceiver ? { scope: hostPath.scope, adapter, path: hostPath } : null,
    });
    // the search only locates the element holding the claim; the recursion below plans its leaf
    const element = guarded || keyedElement ? capture?.elements.find(({ pattern: candidate }) => candidate.type === 'ObjectPattern'
      && subtreeContainsNode(candidate, prop))
      : capture?.elements[0];
    const elementPattern = element?.pattern;
    // Keep alias resolution at the read site: the source's literal can belong to an
    // outer scope, and its slots may have been written since its declaration.
    const source = element?.path.reduce((node, index) => arraySource === arrayReceiver && arraySource?.type === 'ArrayExpression'
      ? resolveCallArgument(peelTransparentExpr(node)?.elements ?? [], index)
      : memberExpression(node, valueLiteral(index), { computed: true }), arrayReceiver);
    const elementPlan = elementPattern?.type === 'ObjectPattern'
      && (guarded || keyedElement || elementPattern.properties.some(isRestProperty)
        || planNestedKeyedPatternCapture({ pattern: elementPattern, init: source, ctx })?.rest)
      && planRetainedObjectCapture({
        pattern: elementPattern,
        init: source,
        assignment,
        prop,
        hostPath,
        adapter,
        resolveNodeType,
        injectorState,
        kind,
        entry,
        patternPath,
        probedInit,
        resolvePure,
        resolveStaticProp,
        planGuardedNarrow,
        isClaimedProp,
        isConsumedProp,
        meta: resolvedMeta,
        provenCtorName: kind === 'static' && resolvedMeta?.object
          && receiverCtorName(peelNestedSequenceExpressions(source).tail, ctx) === resolvedMeta.object ? resolvedMeta.object : null,
      });
    if (elementPlan && (guarded || keyedElement || elementPlan.rest || elementPlan.capture?.rest || elementPlan.nestedRest)) {
      const receiverUnused = elementPlan.readsReceiver === false && !elementPlan.capture && !elementPlan.arrayCapture
        && !elementPlan.defaultCapture && !elementPlan.nestedRest && !elementPlan.rest;
      // Both claimed and native sibling patterns may read a stable source name directly.
      // The shared capture renderer still binds every native leaf in its ordered slot.
      for (const item of capture.elements) {
        if (item.nativeBinding || item === element && receiverUnused) continue;
        const receiver = reusableArrayCaptureReceiver({ ...capture, init }, item, { ...ctx, injectorState });
        if (receiver) item.receiver = receiver;
      }
      return {
        arrayCapture: {
          ...capture,
          init,
          elements: capture.elements.map(item => item === element && receiverUnused
        ? { ...item, receiverUnused: true } : item),
        },
        elementPlan,
        elementPattern,
        assignment,
      };
    }
  }

  // A paired literal's object hop can hold the array position that owns this static
  // leaf. Retain that hop before recursing into the existing ordered array capture.
  if (kind === 'static' && resolvedMeta?.object && !resolvedMeta.guardedAliasHint
    && pattern?.type === 'ObjectPattern' && patternKeepsEffectfulKey(pattern, ctx)
    && !adapter?.isMutatedStatic?.('Array.prototype', 'Symbol.iterator')) {
    const capture = planNestedKeyedPatternCapture({ pattern, init, force: true, allowArray: true, plansLeaf: true, ctx });
    if (capture?.leafPattern.type === 'ArrayPattern') {
      let source = init;
      for (const level of capture.ancestors) {
        const key = foldedPropertyKeyName(level.prop);
        source = key === null ? null : objectLevelPairedProperty(
          unwrapRuntimeExpr(installedWriteValue(source)), key,
        )?.read;
        if (!source) break;
      }
      const innerPlan = source && planRetainedObjectCapture({
        pattern: capture.leafPattern,
        init: source,
        assignment,
        prop,
        hostPath,
        adapter,
        resolveNodeType,
        injectorState,
        kind,
        entry,
        patternPath,
        probedInit,
        resolvePure,
        resolveStaticProp,
        planGuardedNarrow,
        isClaimedProp,
        isConsumedProp,
        meta: resolvedMeta,
      });
      if (innerPlan) return { capture, innerPlan, assignment };
    }
  }

  if (!init || pattern?.type !== 'ObjectPattern') return null;
  // A selecting receiver with a user branch belongs to the per-branch mirror.
  const selection = !guardedFallback && kind === 'static' && computedKeyHasSideEffects(prop, ctx)
    ? unwrapRuntimeExpr(peelNestedSequenceExpressions(init).tail) : null;
  if ((selection?.type === 'ConditionalExpression' || selection?.type === 'LogicalExpression')
    && !allProxySelectingInit(selection, { adapter, injectorState })) return null;
  const guardedPlan = guarded && pattern.properties.includes(prop) && resolvePure ? planGuardedNarrow?.({
    memberNode: memberExpression(identifier(''), identifier(resolvedMeta.key)),
    parent: null,
    meta: guardMeta,
    path: hostPath,
    resolvePure,
    adapter,
  }) : null;
  const narrow = guardedPlan && !guardedPlan.bail
    && (guardedFallback || guardedPlan.instanceFallback?.kind === 'instance') ? guardedPlan : null;
  const rest = pattern.properties.find(isRestProperty);
  if (rest && kind === 'instance') return null;
  // the capture keeps each nested write in its slot: always under rest, and on a discarded
  // assignment wherever a leaf-level item runs code - the extraction canon lands a nested static
  // behind the residual, where a later key or default would still see its target unwritten. A
  // level an earlier channel already took a claim from declines: one binding has dropped that
  // claim from the pattern, the other keeps it until its drain, and only a decline reads alike
  const ordered = orderedClaimCapture({
    pattern,
    init,
    prop,
    kind,
    entry,
    assignment,
    meta: resolvedMeta,
    hostPath,
    isClaimedProp,
    adapter,
    injectorState,
  });
  if (ordered && kind === 'static') {
    const innerPlan = planRetainedObjectCapture({
      pattern: ordered.leafPattern,
      init,
      assignment,
      prop,
      hostPath,
      adapter,
      resolveNodeType,
      injectorState,
      kind,
      entry,
      resolvePure,
      resolveStaticProp,
      isClaimedProp,
      provenCtorName: resolvedMeta.object,
    });
    if (innerPlan) return { capture: ordered, assignment, innerPlan: { ...innerPlan, coerceReceiver: true } };
  }
  // A pristine built-in hop can prove the captured leaf's constructor without a
  // constructor index. Keep that native hop and every leaf key in their source slots.
  if (!ordered && kind === 'static' && resolvedMeta?.object && !resolvedMeta.guardedAliasHint
    && patternKeepsEffectfulKey(pattern, ctx)) {
    const capture = planNestedKeyedPatternCapture({ pattern, init, force: true, plansLeaf: true, ctx });
    const source = capture?.ancestors.reduce((value, level) => {
      const key = foldedPropertyKeyName(level.prop);
      return value && key !== null ? memberFromKeyName(value, key) : null;
    }, installedWriteValue(init));
    const innerPlan = capture?.leafPattern.properties.includes(prop) && source
      && receiverCtorName(source, ctx) === resolvedMeta.object
      && isReReadableSurfaceNav(source, name => !!injectorState?.getBindingInfo?.(name), { ctx })
      && planRetainedObjectCapture({
        pattern: capture.leafPattern,
        init: source,
        assignment,
        prop,
        hostPath,
        adapter,
        resolveNodeType,
        injectorState,
        kind,
        entry,
        resolvePure,
        resolveStaticProp,
        isClaimedProp,
        provenCtorName: resolvedMeta.object,
      });
    if (innerPlan) return { capture, assignment, innerPlan: { ...innerPlan, coerceReceiver: true } };
  }
  // A consumed nested static can extract before the outer rest copy. The receiver
  // proof excludes mutable slots and effectful getters, so its exclusion read is
  // repeatable; unrelated rest getters still run after the nested binding.
  if (rest && kind === 'static' && !pattern.properties.includes(prop)) {
    const nested = pattern.properties.find(item => item.value?.type === 'ObjectPattern'
      && item.value.properties.includes(prop));
    const key = nested && !nested.computed ? foldedPropertyKeyName(nested) : null;
    if (key !== null && pattern.properties.length === 2) {
      const receiver = memberFromKeyName(installedWriteValue(init), key);
      const ctor = receiverCtorName(receiver, { scope: hostPath?.scope, adapter, path: hostPath });
      const inner = ctor && planRetainedObjectCapture({
        pattern: nested.value,
        init: receiver,
        assignment,
        prop,
        hostPath,
        adapter,
        resolveNodeType,
        injectorState,
        kind,
        entry,
        resolvePure,
        resolveStaticProp,
        isClaimedProp,
        provenCtorName: ctor,
      });
      if (inner) return { pattern, init, assignment, prop: nested, rest, primaryKey: key, nestedRest: { prop: nested, plan: inner, key } };
    }
  }
  // A consumed assignment yields its original receiver. The existing ordered capture already
  // keeps that receiver once, writes each claimed slot in source order, and yields the memo.
  // A proven nested constructor under an array capture uses the same ordered binding
  // before its parent's rest copy. Ordinary object declarations retain their existing plan.
  const statement = assignment && hostPath ? peelToExpressionStatement(hostPath)?.exprStmt : null;
  const consumedHost = !!hostPath
    && (assignment ? !!provenCtorName || !assignmentValueDiscarded(hostPath) || kind !== 'global' && discardedSequenceElement(hostPath)
      || !!statement && isBodylessStatementSlot(statement.parentPath?.node, statement.node)
      : !!provenCtorName && hostPath.node?.id?.type === 'ArrayPattern');
  // a consumed assignment yields its receiver, which the flat twin and the overwrite cannot keep
  // (`orderedClaimCapture` says which hops and leaf levels capture)
  if (ordered && kind === 'instance') {
    // the constructor each captured level holds, which a split render's ref for it stands for: a
    // sibling moved onto that ref is re-detected there and resolves its statics through it. a
    // realm level is a hop, not a constructor, and its siblings keep their native reads
    const levelNames = [];
    let receiver = adapter ? unwrapRuntimeExpr(installedWriteValue(init)) : null;
    for (const level of ordered.ancestors) {
      const name = receiver && receiverCtorName(receiver, { scope: hostPath?.scope, adapter, path: hostPath });
      levelNames.push(name && !POSSIBLE_GLOBAL_OBJECTS.has(name) ? name : null);
      const key = level.defaultValue ? null : foldedPropertyKeyName(level.prop);
      receiver = receiver && key !== null ? memberFromKeyName(receiver, key) : null;
    }
    return { capture: { ...ordered, levelNames }, assignment };
  }
  const target = prop?.value?.type === 'AssignmentPattern' ? prop.value.left : prop?.value;
  const consumed = consumedHost && pattern.properties.includes(prop) && target?.type === 'Identifier';
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
    restEffects: provenCtorName ? [] : discardRescueNodesWithReads({ node: init, scope: hostPath?.scope, adapter, path: hostPath }) };

  // Resolve sibling statics that this capture must emit itself: assignment hosts and rest
  // captures cannot rely on later visitors to recover every claim from the minted receiver.
  // Rest may also retain a known pristine native static. Only binding targets qualify - and, on an
  // assignment host, a MEMBER target the extraction canon admits: the render writes whatever it is.
  function siblingStaticEntries() {
    const ctor = initCtorName();
    // The primary instance key may have no static branch, while a sibling still needs
    // the source alias's constructor guard before the capture hides its provenance.
    if ((!assignment && !rest && !guarded && !provenCtorName) || !resolveStaticProp || !resolvePure
      || (!guarded && (!ctor || !isStaticPlacement(ctor)))) return null;
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
      if (guarded && keyName !== null) {
        const siblingNarrow = planGuardedNarrow?.({
          memberNode: memberFromKeyName(identifier(''), keyName),
          parent: null,
          meta: { ...guardMeta, key: keyName },
          path: hostPath,
          resolvePure,
          adapter,
        });
        if (siblingNarrow && !siblingNarrow.bail) entries.set(item, { narrow: siblingNarrow, key: keyName });
        continue;
      }
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
  // A potential sibling claim may still decline its route. Where this read can run user code,
  // the capture keeps every crossed key in its slot. Already consumed keys are excluded, including
  // a hop its split twin moves (`isConsumedProp`, asked of the HOST's own pattern only: a nested or
  // element level recursing here carries the host's init, not the value that level reads)
  const keyOrderSplit = !!hostPath && !!adapter && !rest && pattern.properties.includes(prop)
    && pattern === (assignment ? hostPath.node?.left : hostPath.node?.id)
    && (extractionCrossesResidualKeys() || assignment && pattern.properties.some(item => computedKeyHasSideEffects(item,
      { scope: hostPath.scope, adapter, path: hostPath })));
  function extractionCrossesResidualKeys() {
    const index = pattern.properties.indexOf(prop);
    const ahead = kind === 'instance' || !residualInitRunsEffects({ init, scope: hostPath.scope, adapter, path: hostPath });
    const crossed = pattern.properties.filter(item => item !== prop && pattern.properties.indexOf(item) < index === ahead
      && !isClaimedProp?.(item) && !isConsumedProp?.(item));
    if (!crossed.length) return false;
    const claimRuns = destructureKeyRunsCode(prop, ctx) || claimReadRunsCode();
    return crossed.some(item => {
      const runs = destructureKeyRunsCode(item, ctx);
      if (!runs && !claimRuns) return false;
      const siblingKind = siblingClaimKind(item);
      return claimRuns || (runs ? siblingKind !== 'static' : !siblingKind);
    });
  }
  function claimReadRunsCode() {
    if (kind !== 'instance' || isStaticPlacement(initCtorName() ?? '')) return false;
    const type = resolveNodeType?.(hostPath.get?.(assignment ? 'right' : 'init'));
    return !type?.constructor || type.constructor === 'Function' || type.constructor === 'Object';
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
    && (kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(prop, ctx)))
    && pattern.properties.filter(item => !isConsumedProp || !(isConsumedProp(item)
      || !computedKeyHasSideEffects(item, ctx) && patternFullyConsumed(item.value, isConsumedProp, ctx))).length > 1
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
    element => globalProxyMemberName({ node: peelTransparentExpr(element), scope: hostPath?.scope, adapter, path: hostPath }) !== null,
  );
  if (!narrow && !consumed && !rest && !nestedDefault && !symbolPattern && !nestedSibling
    && !((assignment || pattern.properties.length > 1 || proxyMemberElement)
      && pattern.properties.includes(prop) && computedKeyHasSideEffects(prop, ctx))
    && !(assignment && target?.type === 'MemberExpression' && pattern.properties.includes(prop))
    // A moved leaf on this pass's local capture uses the same ordered render without another memo.
    && !keyOrderSplit && !(receiverRef && isCapturedKeyedPattern(pattern) && kind === 'instance' && entry
      && (entry !== 'get-iterator-method' || target?.type === 'Identifier') && pattern.properties.includes(prop))) return null;
  const primaryStatic = (consumed || rest) && kind !== 'instance' && initCtorName() && resolveStaticProp
    ? resolveStaticProp({
      prop,
      receiverName: initCtorName(),
      resolvePure,
      keyName: resolveKey({
        node: prop.key,
        computed: prop.computed,
        scope: hostPath.scope,
        adapter,
        path: hostPath,
        keepsKeyNode: true,
      }),
    }) : null;
  if ((consumed || rest) && kind !== 'instance' && !primaryStatic && !narrow) return null;
  const retainedStatic = (consumed || rest ? !!primaryStatic : kind === 'static' || kind === 'global')
    && (!assignment || target?.type === 'Identifier' || (keyOrderSplit
      && !!memberTargetTakesExtraction(prop.value, { scope: hostPath.scope, adapter, path: hostPath })))
    && pattern.properties.includes(prop)
    && (consumed || rest || symbolPattern || computedKeyHasSideEffects(prop, ctx) || keyOrderSplit);
  if (kind !== 'instance' && !symbolPattern && !retainedStatic && !nestedSibling && !narrow) return null;
  // A consumed global assignment must still yield the realm while its binding receives the
  // polyfilled constructor. Discarded writes keep their existing direct extraction.
  if (!provenCtorName && !symbolPattern && !nestedSibling && adapter
    && (kind !== 'global' || !assignment || assignmentValueDiscarded(hostPath))
    && allProxySelectingInit(init, { adapter, injectorState })) return null;
  const siblingStatics = siblingStaticEntries();
  const hostPattern = hostPath?.node?.type === 'VariableDeclarator' ? hostPath.node.id : hostPath?.node?.left;
  const receiverNeverNullish = !isCapturedKeyedPattern(pattern)
    && keyedReadReceiverProven({ init, hostPath, adapter, nested: hostPattern !== pattern });
  // Rest gathers the original receiver with the same exclusions. Only pristine statics
  // admit the repeated exclusion reads; user getters stay on the ordinary native route.
  // Key effects run with their ordered writes, then the exclusions use their folded keys.
  if (rest && (!retainedStatic || pattern.properties.some(item => item !== rest
    && (!propBindingIdentifier(item.value) || (item !== prop && !siblingStatics?.has(item)))))) return null;
  return {
    pattern,
    init,
    assignment,
    prop,
    narrow,
    retainedStatic,
    primaryPure: primaryStatic?.pure,
    siblingStatics,
    readsReceiver: !!narrow || !retainedStatic || !!rest || pattern.properties.some(item => item !== prop
      && !isClaimedProp?.(item) && (!siblingStatics?.has(item)
        || siblingStatics.get(item).native || siblingStatics.get(item).narrow)),
    rest,
    // the receiver IS a constructor the read side names, on a spelling that cannot come out nullish
    // (no `?.`, no lowered short-circuit), or a value that never is: the null rejection the keyed read
    // would keep in front of the key's effects is dead there
    provenReceiver: (!narrow && !!isStaticPlacement(initCtorName() ?? '') && !valueMayBeNullish(init)) || receiverNeverNullish,
    // A source receiver with a proven fallback cannot be nullish (`x || Object`). A moved leaf
    // reads a captured property instead; its constructor-name projection depends on hop relocation.
    receiverNeverNullish,
    // the constructor an assignment's memo holds: a residual left on the memo resolves through it
    receiverName: assignment && !POSSIBLE_GLOBAL_OBJECTS.has(initCtorName() ?? '') ? initCtorName() : null,
    primaryKey: narrow ? resolvedMeta.key : rest ? resolveKey({
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
      ? new Set(pattern.properties.filter(item => isClaimedProp(item))) : null,
  };
}

// the receiver of a keyed destructure read IS a constructor the read side names, or a value that is
// never nullish, on a spelling that cannot come out nullish (no `?.`, no lowered short-circuit): the
// null-first rejection the read keeps in front of the key's effects is dead there
// `nested`: the pattern reads a SLOT of the init (an array-wrapper element, a captured hop), which
// only a constructor-named init still proves
export function keyedReadReceiverProven({ init, hostPath, adapter, nested = false }) {
  if (!adapter || !init || valueMayBeNullish(init)) return false;
  const ctx = { scope: hostPath?.scope, adapter, path: hostPath };
  function proven(node) {
    let value = installedWriteValue(node);
    // a `||` / `??` selection yields its LEFT only where that is truthy / non-nullish, so a right operand
    // proven here proves the whole value (`x || Object`): the null probe would guard a value never nullish
    for (let selection = unwrapRuntimeExpr(value); selection?.type === 'LogicalExpression' && selection.operator !== '&&';
      selection = unwrapRuntimeExpr(value)) value = installedWriteValue(selection.right);
    // a conditional yields one of its arms, so the two proven prove it
    const branch = unwrapRuntimeExpr(value);
    if (!nested && branch?.type === 'ConditionalExpression') return proven(branch.consequent) && proven(branch.alternate);
    // ... and so does a value that names nothing: a literal, a literal binding, a built-in's prototype
    if (!nested && receiverValueNeverNullish(value, ctx)) return true;
    const name = resolveObjectName({ objectNode: value, ...ctx })
      ?? staticContainerReceiverName({ node: value, ...ctx, rescuesReceiverRead: true });
    return !!isStaticPlacement(name ?? '');
  }
  return proven(init);
}

// Keep native property patterns around the claimed read so keys, defaults and sibling
// effects retain their positions. A static-only rest uses one native exclusion pattern.
// eslint-disable-next-line max-statements -- one ordered render for every retained property role
export function renderRetainedObjectCapture(plan, {
  mintRef,
  mintDeclaredRef,
  mintReceiverRef = mintDeclaredRef,
  injectImport,
  entry,
  hintName,
  embed = node => node,
  anchorPure = null,
  noteStaticAlias = null,
  mintUnused = mintRef,
  claimProperties = null,
  ctx = null,
  noteRefAlias = null,
  resolveGlobalPolyfill = null,
  sourceExpression = node => node,
}) {
  if (plan.defaultCapture) return renderRetainedDefaultCapture(plan.defaultCapture, {
    mintRef,
    mintDeclaredRef,
    injectImport,
    resolveGlobalPolyfill,
    adapter: ctx?.adapter,
    embed,
    sourceExpression,
    claimProperties,
  });
  if (plan.restPure) {
    claimProperties?.(plan.pattern.properties.filter(item => item.type !== 'RestElement'));
    const pattern = embed(plan.pattern);
    const init = plan.restSource ? embed(plan.restSource) : sequenceExpression([...plan.restEffects.map(embed),
      identifier(injectImport(plan.restPure.entry, plan.restPure.hintName))]);
    return plan.assignment ? { expression: assignmentExpression('=', pattern, init) }
      : { declarations: [variableDeclarator(pattern, init)] };
  }
  if (plan.arrayCapture || plan.capture && !plan.assignment) {
    const capturePlan = plan.arrayCapture ?? plan.capture;
    const elementPattern = plan.elementPattern ?? capturePlan.leafPattern;
    const renderCapture = plan.arrayCapture ? renderArrayWrapperCapture : renderNestedKeyedPatternCapture;
    const captured = renderCapture({ ...capturePlan, init: plan.init ?? capturePlan.init }, {
      mintRef: plan.assignment ? mintDeclaredRef : mintRef, embed,
      receiverRef: !plan.assignment ? plan.receiverRef : null,
    });
    const capturedElement = captured.elements.find(item => item.pattern === elementPattern);
    const receiverRef = capturedElement.ref;
    const inner = plan.elementPlan || plan.innerPlan ? renderRetainedObjectCapture({
      ...plan.elementPlan ?? plan.innerPlan,
      init: receiverRef ? identifier(receiverRef) : voidZero(),
      receiverRef,
      reuseReceiver: !!capturedElement.receiver,
      receiverAlreadyEvaluated: !receiverRef,
      coerceReceiver: !!receiverRef && (plan.elementPlan ?? plan.innerPlan).coerceReceiver,
      preserveResult: false,
    }, {
      mintRef,
      mintDeclaredRef,
      injectImport,
      entry,
      hintName,
      embed,
      anchorPure,
      noteStaticAlias,
      mintUnused,
      claimProperties,
    }) : null;
    if (!plan.assignment) return {
      declarations: [
        captured.capture,
        ...captured.elements.flatMap(element => element.pattern === elementPattern && inner ? inner.declarations
          : element.declarator ? [element.declarator] : []),
      ],
    };
    const result = plan.preserveResult !== false ? identifier(mintDeclaredRef()) : null;
    return {
      expression: sequenceExpression([
        assignmentExpression('=', captured.capture.id,
        result ? assignmentExpression('=', result, captured.capture.init) : captured.capture.init),
        ...captured.elements.flatMap(element => element.pattern === elementPattern ? [inner.expression]
        : element.declarator ? [assignmentExpression('=', element.declarator.id, element.declarator.init)] : []),
        ...result ? [result] : [],
      ]),
    };
  }
  if (plan.capture) return renderNestedKeyedPatternCapture({ ...plan.capture, init: plan.init ?? plan.capture.init }, {
    mintRef: mintDeclaredRef,
    embed,
    assignment: true,
    preserveResult: plan.preserveResult !== false,
    injectImport,
    anchorPure,
    noteRefAlias,
    coerceLeaf: plan.innerPlan?.readsReceiver === false && plan.innerPlan.coerceReceiver,
    renderLeaf: plan.innerPlan ? init => renderRetainedObjectCapture({
      ...plan.innerPlan,
      init: init ?? voidZero(),
      receiverRef: init?.name,
      preserveResult: false,
      coerceReceiver: !!init && plan.innerPlan.coerceReceiver,
      receiverAlreadyEvaluated: !init,
    }, {
      mintRef,
      mintDeclaredRef,
      injectImport,
      entry,
      hintName,
      embed: node => node === init ? node : embed(node),
      anchorPure,
      noteStaticAlias,
      mintUnused,
      claimProperties,
    }).expression : plan.capture.inlineLeaf ? receiver => assignmentExpression('=', embed(plan.capture.leaf.value),
      callExpression(identifier(injectImport(entry, hintName)), [receiver])) : null,
  });
  entry = plan.primaryPure?.entry ?? entry;
  hintName = plan.primaryPure?.hintName ?? hintName;
  // one fresh node per position: a binding that inserts ESTree as is must not find the memo's own
  // binding when it later swaps a node it reached through one of the reads
  let refName = plan.receiverRef;
  // ... and whether anything read it - a reused source name is spelled before any read
  let receiverRead = false;
  function ref() {
    receiverRead = true;
    if (plan.inlineReceiver) return embed(cloneNode(plan.init));
    if (!refName) {
      refName = plan.assignment ? mintReceiverRef() : mintRef();
      if (plan.receiverName) noteRefAlias?.(refName, plan.receiverName);
    }
    return identifier(refName);
  }
  const init = embed(plan.init);
  const declarations = [];
  // A leading native pattern already rejects null before any effectful key.
  const firstProp = plan.pattern.properties.find(prop => !plan.claimedProps?.has(prop));
  const firstNative = firstProp && firstProp !== plan.prop && firstProp !== plan.rest
    && firstProp !== plan.nestedRest?.prop && !plan.siblingStatics?.has(firstProp)
    && !computedKeyHasSideEffects(firstProp, ctx);
  // A prefix still evaluates its complete initializer before any native or claimed read.
  const prefixedReuse = plan.reuseReceiver && unwrapRuntimeExpr(plan.init)?.type === 'SequenceExpression';
  const coerceReuse = plan.reuseReceiver && (!plan.provenReceiver && (plan.assignment || !firstNative)
    || prefixedReuse && !plan.assignment);
  if (!plan.assignment) {
    if (coerceReuse) declarations.push(variableDeclarator(objectPattern([]), init));
    else if (!plan.receiverRef && !plan.inlineReceiver && !plan.receiverAlreadyEvaluated) {
      declarations.push(variableDeclarator(ref(), init));
    }
  }
  const assignments = [];
  let receiverCoerced = !!plan.coerceReceiver || !!coerceReuse || !!plan.receiverAlreadyEvaluated;
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
      if (plan.assignment) assignments.push(assignmentExpression('=', residual, ref()));
      else declarations.push(variableDeclarator(residual, ref()));
    } else if (prop === plan.nestedRest?.prop) {
      const nestedInit = memberFromKeyName(ref(), plan.nestedRest.key);
      const inner = renderRetainedObjectCapture({ ...plan.nestedRest.plan, init: nestedInit }, {
        mintRef,
        mintDeclaredRef,
        injectImport,
        entry,
        hintName,
        embed: node => node === nestedInit ? node : embed(node),
        anchorPure,
        noteStaticAlias,
        mintUnused,
        claimProperties,
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
      declarations.push(plan.provenReceiver || receiverCoerced
        ? variableDeclarator(embed(target), keys.length ? sequenceExpression([...keys, read]) : read)
        : renderKeyedDestructureRead({ receiverName: refName, receiver: ref(), binding: embed(target), keys, read }).at(-1));
    } else if (!plan.assignment && prop === plan.prop && entry) {
      const defaulted = prop.value.type === 'AssignmentPattern';
      const target = defaulted ? prop.value.left : prop.value;
      // The guarded plan owns the static branch and its instance or native fallback.
      let read = plan.narrow
        ? renderCtorIdentityNarrow(plan.narrow, memberFromKeyName(ref(), plan.primaryKey), { injectImport, spellRecv: ref })
        : callExpression(identifier(injectImport(entry, hintName)), [ref()]);
      if (defaulted) {
        const memo = identifier(mintDeclaredRef());
        read = renderInstanceDefaultGuard({
          assignedRef: memo,
          call: read,
          reread: memo,
          defaultValue: embed(prop.value.right),
          defaultName: target.name,
        });
      }
      const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
      const keyEffects = prop.computed ? observableSequenceElements([...prefix, tail], ctx).map(embed) : [];
      // The dispatch reads the property itself; only key effects need an earlier null rejection.
      declarations.push(keyEffects.length ? renderKeyedDestructureRead({
        receiverName: refName,
        receiver: ref(),
        binding: embed(target),
        keys: keyEffects,
        read,
        proven: plan.receiverNeverNullish || receiverCoerced,
      }).at(-1) : variableDeclarator(embed(target), read));
    } else if (plan.assignment && prop === plan.prop) {
      const defaulted = prop.value.type === 'AssignmentPattern';
      const target = defaulted ? prop.value.left : prop.value;
      if (plan.retainedStatic && plan.primaryPure?.kind !== 'global' && target.type === 'Identifier') {
        noteStaticAlias?.(target.name, entry);
      }
      const pure = plan.narrow ? null : identifier(injectImport(entry, hintName));
      // The guarded plan owns the static branch and its instance or native fallback.
      let read = plan.narrow ? renderCtorIdentityNarrow(
        plan.narrow,
        memberFromKeyName(ref(), plan.primaryKey),
        { injectImport, spellRecv: ref },
      )
        : plan.retainedStatic ? pure : callExpression(pure, [ref()]);
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
      // A direct polyfill drops the dead default; a guarded native fallback keeps it.
      const { entry: siblingEntry, hint, native, key, narrow } = plan.siblingStatics.get(prop);
      const target = prop.value.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      if (!native && !narrow && target.type === 'Identifier') noteStaticAlias?.(target.name, siblingEntry);
      const raw = narrow || native ? memberFromKeyName(ref(), key) : null;
      let read = narrow ? renderCtorIdentityNarrow(narrow, raw, { injectImport, spellRecv: ref })
        : native ? raw : identifier(injectImport(siblingEntry, hint));
      if (narrow && prop.value.type === 'AssignmentPattern') {
        const memo = identifier(mintDeclaredRef());
        read = renderInstanceDefaultGuard({
          assignedRef: memo,
          call: read,
          reread: memo,
          defaultValue: embed(prop.value.right),
          defaultName: target.name,
        });
      }
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
      const residual = { ...plan.pattern, properties: [prop] };
      if (isCapturedKeyedPattern(plan.pattern)) markCapturedKeyedPattern(residual);
      const pattern = embed(residual);
      if (plan.assignment) assignments.push(assignmentExpression('=', pattern, ref()));
      else declarations.push(variableDeclarator(pattern, ref()));
      receiverCoerced = true;
    }
    // A computed key rejects null before its effects. A plain member target is evaluated
    // first, so keep its native assignment ahead of the property read's null rejection.
    if (plan.assignment && prop.computed && !plan.provenReceiver && !receiverCoerced) {
      assignments.push(conditionalExpression(nullFirstGuardTest(ref()),
        memberExpression(ref(), valueLiteral(''), { computed: true }), sequenceExpression(assignments.splice(assignmentStart))));
    }
  }
  // the memo leads the rebuilt expression, so an effect the source ran AHEAD of the pattern runs
  // there, once, in the slot the source gave it - this render performs it and no channel may lift
  // it a second time. reading the bare tail instead would take the prefix out of the tree before
  // the walk reaches it, and the claims INSIDE it go out unrendered
  if (plan.coerceReceiver && !plan.reuseReceiver) ref();
  const result = plan.assignment && plan.preserveResult !== false ? ref() : null;
  // ... and an init nothing reads and nothing coerces is owed only what discarding it runs - the discard
  // rescue the statement host lifts: its effects and a read only a getter answers, of a selection its left
  // decides the live left's (a TS wrapper leaves with the value it wraps)
  const discarded = plan.assignment && !receiverRead && plan.provenReceiver && ctx
    ? discardRescueNodesWithReads({ node: unwrapRuntimeExpr(plan.init), ...ctx }).map(embed) : null;
  return plan.assignment ? {
    refName,
    expression: sequenceExpression([
      ...plan.receiverAlreadyEvaluated || plan.inlineReceiver ? [] : plan.reuseReceiver
        ? coerceReuse ? [assignmentExpression('=', objectPattern([]), init)] : prefixedReuse ? discarded ?? [init] : []
        : plan.receiverRef ? [] : refName ? [assignmentExpression('=', ref(), init)] : discarded ?? [init],
      ...plan.coerceReceiver && !plan.reuseReceiver ? [assignmentExpression('=', objectPattern([]), ref())] : [],
      ...assignments,
      ...result ? [result] : [],
    ]),
  } : { refName, declarations };
}

// --- the minifier-sequence split ---
// Collect only matching statement positions during the existing file census. Keep the source
// nodes and operands intact: directives and the other reducers still read the pristine tree.
// Read the host's declared slots: statement-shaped sidecars are not list members.
// The plan consumes this index without walking unrelated subtrees a second time.
export function minifierSequenceReducer() {
  const minifierSequences = [];
  return {
    visit(host) {
      const statements = statementListOf(host);
      if (statements) for (const statement of statements) {
        const expressions = getMinifierSequenceExpressions(statement);
        if (expressions) minifierSequences.push({ statements, statement, expressions });
      }
      for (const key of SINGLE_STATEMENT_SLOTS.get(host.type) ?? []) {
        const statement = host[key];
        const expressions = getMinifierSequenceExpressions(statement);
        if (expressions) minifierSequences.push({ host, key, statement, expressions });
      }
    },
    result: () => ({ minifierSequences }),
  };
}

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
// statement's index at apply time. Bindings supply their census; standalone callers collect it here.
export function planMinifierSequenceSplit(root, { embed = node => node, census = null } = {}) {
  const { minifierSequences } = census ?? collectFileCensus(root, [minifierSequenceReducer()]);
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
  return minifierSequences.map(({ expressions, ...position }) => ({
    ...position, products: expressions.flatMap(operandProducts),
  }));
}
