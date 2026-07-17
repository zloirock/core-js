// a top-level `{ iterator } = Symbol` alias folds a computed member to the iterator-method
// helper; a NESTED-pattern binding of the same name (`{ constructor: { iterator } }`) reads
// `Symbol.constructor.iterator` (=== undefined at runtime), NOT the well-known key, so it must
// stay a raw computed read - the flat name-keyed fold would substitute the wrong value
const { iterator } = Symbol;
export const viaTopLevel = [1, 2][iterator];

export function nestedShadow() {
  const { constructor: { iterator } } = Symbol;
  return [3, 4][iterator];
}

// the renamed top-level form still folds; an assignment-form top-level folds too
const { iterator: renamed } = Symbol;
export const viaRenamed = [5, 6][renamed];

let assigned;
({ iterator: assigned } = Symbol);
export const viaAssign = [7, 8][assigned];

// a NESTED assignment-form binding also bails
let deep;
({ constructor: { iterator: deep } } = Symbol);
export const viaNestedAssign = [9][deep];

// same-named aliases in SIBLING closures are separate bindings: EACH scope's consumer folds
// off its own registration record (a flat first-write-wins registry served only the first
// closure and lost every later fold on the target engine - read AND call shapes both fold)
function siblingA() {
  const { iterator } = Symbol;
  return typeof [][iterator];
}
function siblingB() {
  const { iterator } = Symbol;
  return [3, 4][iterator]().next().value;
}
export const viaSiblings = [siblingA(), siblingB()];

// the same-name INNER shadow off a user object still reads the user value while the outer
// same-file alias keeps its fold - the sibling records disambiguate positionally
const { iterator: outerIt } = Symbol;
export const viaOuter = typeof [][outerIt];
function shadowedSibling() {
  const userSymbol = { iterator: 1 };
  const { iterator } = userSymbol;
  return ['a', 'b'][iterator];
}
export const viaShadowedSibling = shadowedSibling();

// a binding holding a well-known-symbol VALUE (not the constructor) is NOT a Symbol source:
// destructuring `iterator` OFF that value reads `(symbol).iterator` (undefined at runtime),
// so the consumer must keep the raw read and the default - while a direct computed read of
// the VALUE alias itself still folds (it IS the well-known key)
function valueAliasHost() {
  const { iterator: Symbol } = globalThis.Symbol;
  const { iterator: viaValue = 'fb' } = Symbol;
  return ['v'][viaValue];
}
export const viaValueAlias = valueAliasHost();
const { iterator: SymVal } = globalThis.Symbol;
export const viaValueRead = [][SymVal];
function judgeChannelHost() {
  const { iterator } = SymVal;
  return [1][iterator];
}
export const viaJudgeChannel = judgeChannelHost();
