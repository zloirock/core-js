import {
  SINGLE_STATEMENT_SLOTS,
  allProxySelectingInit,
  computedKeyHasSideEffects,
  foldedPropertyKeyName,
  forEachStatementPosition,
  getMinifierSequenceExpressions,
  isQuietLiteralOperand,
  isRestProperty,
  mayHaveSideEffects,
  observableSequenceElements,
  patternSlotTarget,
  peelNestedSequenceExpressions,
  peelTransparentExpr,
} from './helpers/ast-patterns.js';
import {
  assignmentExpression,
  callExpression,
  conditionalExpression,
  expressionStatement,
  identifier,
  literal as valueLiteral,
  memberExpression,
  nullFirstGuardTest,
  renderCtorIdentityNarrow,
  renderInstanceDefaultGuard,
  renderKeyedDestructureRead,
  sequenceExpression,
  variableDeclarator,
} from './render.js';
import { globalProxyMemberName, isStaticPlacement, resolveKey, resolveObjectName, symbolSourcedFoldedKey } from './detect-usage/resolve.js';
import { toHint } from './resolve-node-type/base.js';

const capturedKeyedPatterns = new WeakSet();
// A moved leaf still owes the coercion and reads its source pattern performed before capture.
export function isCapturedKeyedPattern(pattern) {
  return capturedKeyedPatterns.has(pattern);
}

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
// Spread/rest positions keep their original route because their number of bindings is not fixed.
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
      || literal?.elements?.some(element => element?.type === 'SpreadElement')) return false;
    return level.elements.every((element, index) => {
      if (!element) return true;
      const position = [...path, index];
      const source = literal?.type === 'ArrayExpression' ? literal.elements[index] : null;
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
// keys and getters; only the inner pattern moves onto the captured value.
export function planNestedKeyedPatternCapture({ pattern, init, force = false, ancestors: sourceAncestors = null }) {
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
      return value?.type === 'ObjectPattern';
    });
    if (nested.length !== 1) break;
    const [prop] = nested;
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null;
    const defaultValue = !force && prop.value?.type === 'AssignmentPattern' ? prop.value : null;
    const value = defaultValue ? defaultValue.left : prop.value;
    if (value?.type !== 'ObjectPattern') break;
    ancestors.push({ pattern: inner, prop, defaultValue });
    inner = value;
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

// Replace only the innermost source pattern with the captured binding. Each outer key stays in
// its original native pattern, while the moved leaf is ready for the ordinary direct emitter.
export function renderNestedKeyedPatternCapture(plan, {
  mintRef, embed = node => node, narrow = null, split = null, injectImport = null, assignment = false, preserveResult = false,
}) {
  capturedKeyedPatterns.add(plan.leafPattern);
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
  if (assignment) {
    const capture = assignmentExpression('=', embed(captured), embed(plan.init));
    const result = preserveResult ? splitCapture ? captured : identifier(mintRef()) : null;
    return { elements, expression: sequenceExpression([
      result && !splitCapture ? assignmentExpression('=', result, capture) : capture,
      ...elements.map(({ declarator }) => assignmentExpression('=', declarator.id, declarator.init)),
      ...result ? [result] : [],
    ]) };
  }
  return {
    capture: variableDeclarator(embed(captured), embed(plan.init)),
    elements,
  };
}

// An effectful key cannot keep a sentinel: that reads its getter twice. Split the level
// into native single-property patterns. A rest-bearing level stays native as a whole.
// Nested patterns remain native operands, so their iterator/default effects keep their position.
export function planRetainedObjectCapture({
  pattern, init, assignment = false, prop = null, hostPath = null, adapter = null, resolveNodeType = null, injectorState = null,
  kind = 'instance', entry = null, patternPath = null, probedInit = false,
}) {
  if (!init || pattern?.type !== 'ObjectPattern' || pattern.properties.some(isRestProperty)) return null;
  if (assignment && kind === 'instance' && entry !== 'get-iterator-method' && !pattern.properties.includes(prop)) {
    const capture = planNestedKeyedPatternCapture({ pattern, init });
    if (capture?.leafPattern.properties.includes(prop)) return { capture };
  }
  const target = prop?.value?.type === 'AssignmentPattern' ? prop.value.left : prop?.value;
  const nestedDefault = !assignment && pattern.properties.length > 1
    && pattern.properties.some(item => item.value?.type === 'AssignmentPattern' && item.value.left?.type === 'ObjectPattern');
  const symbolPatternCandidate = !assignment && pattern.properties.length > 1
    && pattern.properties.some(item => item.computed && item.value?.type === 'ObjectPattern');
  // A nested extraction stays between the outer siblings instead of overtaking their getters.
  const nestedSibling = !assignment && (kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(prop)))
    && pattern.properties.length > 1
    && !pattern.properties.includes(prop)
    && !(kind !== 'static' && adapter && !probedInit && isStaticPlacement(resolveObjectName({
      objectNode: init, scope: hostPath?.scope, adapter, path: hostPath,
    }) ?? ''));
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
  if (!nestedDefault && !symbolPattern && !nestedSibling
    && !((assignment || pattern.properties.length > 1 || proxyMemberElement)
      && pattern.properties.includes(prop) && computedKeyHasSideEffects(prop))
    && !(assignment && target?.type === 'MemberExpression' && pattern.properties.includes(prop))) return null;
  const retainedStatic = kind === 'static' && (!assignment || target?.type === 'Identifier')
    && pattern.properties.includes(prop)
    && computedKeyHasSideEffects(prop);
  if (kind !== 'instance' && !symbolPattern && !retainedStatic && !nestedSibling) return null;
  if (!symbolPattern && !nestedSibling && adapter && allProxySelectingInit(init, { adapter, injectorState })) return null;
  const nested = assignment && !pattern.properties.includes(prop)
    ? pattern.properties.map(item => planNestedKeyedPatternCapture({
      pattern: { ...pattern, properties: [item] }, init, force: true,
    })).find(plan => plan?.leaf === prop && plan.leafPattern.properties.length === 1) : null;
  return { pattern, init, assignment, prop, nested, retainedStatic };
}

// Keep native property patterns around the claimed read so keys, defaults and sibling
// effects retain their positions. Rest never reaches this renderer.
export function renderRetainedObjectCapture(plan, {
  mintRef, mintDeclaredRef, injectImport, entry, hintName, embed = node => node,
}) {
  if (plan.capture) return renderNestedKeyedPatternCapture(plan.capture, {
    mintRef: mintDeclaredRef, embed, assignment: true, preserveResult: true,
  });
  const ref = identifier(plan.assignment ? mintDeclaredRef() : mintRef());
  const declarations = [variableDeclarator(ref, embed(plan.init))];
  const assignments = [];
  for (const prop of plan.pattern.properties) {
    const assignmentStart = assignments.length;
    if (prop === plan.nested?.ancestors[0].prop) {
      const captured = renderNestedKeyedPatternCapture(plan.nested, { mintRef: mintDeclaredRef, embed });
      assignments.push(
        assignmentExpression('=', captured.capture.id, ref),
        assignmentExpression('=', embed(plan.prop.value), callExpression(identifier(injectImport(entry, hintName)), [
          identifier(captured.elements[0].ref),
        ])),
      );
    } else if (plan.retainedStatic && !plan.assignment && prop === plan.prop) {
      // The key observes the old binding; later siblings observe the initialized pure value.
      const target = prop.value.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
      declarations.push(renderKeyedDestructureRead({
        receiverName: ref.name, receiver: ref, binding: embed(target),
        keys: observableSequenceElements([...prefix, tail]).map(embed),
        read: identifier(injectImport(entry, hintName)),
      }).at(-1));
    } else if (plan.assignment && prop === plan.prop) {
      const defaulted = prop.value.type === 'AssignmentPattern';
      const target = defaulted ? prop.value.left : prop.value;
      const pure = identifier(injectImport(entry, hintName));
      let read = plan.retainedStatic ? pure : callExpression(pure, [ref]);
      if (defaulted && !plan.retainedStatic) {
        const memo = identifier(mintDeclaredRef());
        read = renderInstanceDefaultGuard({ assignedRef: memo, call: read, reread: memo,
          defaultValue: embed(prop.value.right), defaultName: target.name });
      }
      const write = assignmentExpression('=', embed(target), read);
      const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
      const keyEffects = prop.computed ? observableSequenceElements([...prefix, tail]).map(embed) : [];
      assignments.push(keyEffects.length ? sequenceExpression([...keyEffects, write]) : write);
    } else {
      const pattern = embed({ ...plan.pattern, properties: [prop] });
      if (plan.assignment) assignments.push(assignmentExpression('=', pattern, ref));
      else declarations.push(variableDeclarator(pattern, ref));
    }
    // A computed key rejects null before its effects. A plain member target is evaluated
    // first, so keep its native assignment ahead of the property read's null rejection.
    if (plan.assignment && prop.computed) {
      assignments.push(conditionalExpression(nullFirstGuardTest(ref),
        memberExpression(ref, valueLiteral(''), { computed: true }), sequenceExpression(assignments.splice(assignmentStart))));
    }
  }
  return plan.assignment ? { expression: sequenceExpression([
    assignmentExpression('=', ref, embed(plan.init)),
    ...assignments, ref,
  ]) } : { declarations };
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
