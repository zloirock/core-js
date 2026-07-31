import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a computed-key ALIAS resolves in its own declaration scope, hop by hop: a use-site shadow
// of an init name must not swallow the module-level value the alias actually holds, and an
// alias of the shadow itself must stay unresolved
const j = 'from';
const k = j;

// the param shadows the alias SOURCE name - the module-level alias still resolves
export function viaShadowedSourceName(j) {
  return _Array$from([1]);
}

// NEGATIVE: an alias of the PARAM is an arbitrary caller value - the computed dispatch
// keeps its own guard
export function viaParamKeyAlias(j) {
  const p = j;
  return Array[p]?.([2]);
}

// a TWO-HOP key alias follows transitively through both declaration scopes
const l = k;
export const viaTwoHopKey = _Array$from([3]);

// a BLOCK shadow of the source name holding a DIFFERENT valid key must not swap the resolved
// method: the alias binds the OUTER 'from', so the dispatch stays Array.from, never Array.of
export function viaBlockShadowedSource() {
  {
    const j = 'of';
    void j;
    return _Array$from([4]);
  }
}

// a var-hoisted alias from a nested block resolves its init in the DECLARATOR's block - the
// later block shadow of the source name must not swap the key (both parsers must report the
// same declaration scope for the hoisted var)
export function viaVarHoistedAlias() {
  {
    var hoisted = j;
  }
  {
    const j = 'of';
    void j;
    return _Array$from([5]);
  }
}

// an SE-carrying alias init keeps its effect at the declaration and still names the key
let seCount = 0;
const seKey = (seCount++, j);
export const viaSeInitAlias = _Array$from([6]);

// a SYMBOL-key alias chain folds through the same per-hop scope advance, under a same-name
// param shadow of its source
const iter = _Symbol$iterator;
const aliasedIter = iter;
export function viaSymbolAliasShadowed(iter) {
  return _getIteratorMethod([7, 8]);
}

// NEGATIVE: a key alias REASSIGNED inside a loop is live under both values - the dispatch
// keeps its own guard on every pass
export const loopOut = [];
let loopKey = 'from';
export function viaLoopReassignedKey() {
  for (let i = 0; i < 2; i++) {
    _pushMaybeArray(loopOut).call(loopOut, Array[loopKey]?.([1]));
    loopKey = 'of';
  }
}

// NEGATIVE: the alias captured its source BEFORE a later write crossed a closure boundary -
// the conservative bail keeps the raw dispatch reading the captured value
let crossSource = 'from';
export const viaCrossBoundaryCapture = () => Array[crossKey]?.([2]);
const crossKey = crossSource;
crossSource = 'of';