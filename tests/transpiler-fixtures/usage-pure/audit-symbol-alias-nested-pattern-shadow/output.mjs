import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a top-level `{ iterator } = Symbol` alias folds a computed member to the iterator-method
// helper; a NESTED-pattern binding of the same name (`{ constructor: { iterator } }`) reads
// `Symbol.constructor.iterator` (=== undefined at runtime), NOT the well-known key, so it must
// stay a raw computed read - the flat name-keyed fold would substitute the wrong value
const iterator = _Symbol$iterator;
export const viaTopLevel = _getIteratorMethod([1, 2]);
export function nestedShadow() {
  const {
    constructor: {
      iterator
    }
  } = _Symbol;
  return [3, 4][iterator];
}

// the renamed top-level form still folds; an assignment-form top-level folds too
const renamed = _Symbol$iterator;
export const viaRenamed = _getIteratorMethod([5, 6]);
let assigned;
assigned = _Symbol$iterator;
export const viaAssign = _getIteratorMethod([7, 8]);

// a NESTED assignment-form binding also bails
let deep;
({
  constructor: {
    iterator: deep
  }
} = _Symbol);
export const viaNestedAssign = [9][deep];

// same-named aliases in SIBLING closures are separate bindings: EACH scope's consumer folds
// off its own registration record (a flat first-write-wins registry served only the first
// closure and lost every later fold on the target engine - read AND call shapes both fold)
function siblingA() {
  const iterator = _Symbol$iterator;
  return typeof _getIteratorMethod([]);
}
function siblingB() {
  const iterator = _Symbol$iterator;
  return _getIterator([3, 4]).next().value;
}
export const viaSiblings = [siblingA(), siblingB()];

// the same-name INNER shadow off a user object still reads the user value while the outer
// same-file alias keeps its fold - the sibling records disambiguate positionally
const outerIt = _Symbol$iterator;
export const viaOuter = typeof _getIteratorMethod([]);
function shadowedSibling() {
  const userSymbol = {
    iterator: 1
  };
  const {
    iterator
  } = userSymbol;
  return ['a', 'b'][iterator];
}
export const viaShadowedSibling = shadowedSibling();

// a binding holding a well-known-symbol VALUE (not the constructor) is NOT a Symbol source:
// destructuring `iterator` OFF that value reads `(symbol).iterator` (undefined at runtime),
// so the consumer must keep the raw read and the default - while a direct computed read of
// the VALUE alias itself still folds (it IS the well-known key)
function valueAliasHost() {
  const Symbol = _Symbol$iterator;
  const {
    iterator: viaValue = 'fb'
  } = Symbol;
  return ['v'][viaValue];
}
export const viaValueAlias = valueAliasHost();
const SymVal = _Symbol$iterator;
export const viaValueRead = _getIteratorMethod([]);
function judgeChannelHost() {
  const {
    iterator
  } = SymVal;
  return [1][iterator];
}
export const viaJudgeChannel = judgeChannelHost();