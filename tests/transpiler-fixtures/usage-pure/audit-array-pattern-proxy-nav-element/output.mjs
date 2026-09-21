import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
// An array element navigating proxy globals receives the same static as the plain receiver.
// Nested receiver and host rewrites must compose without losing the claim.
let n = 0;
let w;
let getPrototypeOf;
export const [{
  of
}] = [{
  of: _Array$of
}];
export const trunc = _Math$trunc;
export const from = _Array$from;
export const keys = ((null == _globalThis.window ? void 0 : Object).keys, _Object$keys);
export const [{
  entries
}] = [((n++, _self).Object, {
  entries: _Object$entries
})];
export const [{
  values
}] = [((w = _self).Object, {
  values: _Object$values
})];
// the ASSIGNMENT form takes the CASCADE render instead of the flatten's - and only when the
// destructured name resolves to a static, which is what makes that render replace the statement
[{
  getPrototypeOf
}] = [{
  getPrototypeOf: _Object$getPrototypeOf
}];
// a NESTED array pattern reaches the same render through one more wrapper
export const [[{
  freeze
}]] = [[{
  freeze: _Object$freeze
}]];
// a pattern DEFAULT puts the nav in the slot the flatten rewrites rather than in the init; the hole
// fires it, so the default is mirrored whole
export const [{
  seal
} = {
  seal: _Object$seal
}] = [];
// NEGATIVE: a single-hop nav needs no receiver collapse, so nothing is queued inside
export const [{
  isArray
}] = [_globalThis.Array];
// NEGATIVE: the object-pattern host was never affected - it renders through the same flatten
export const getOwnPropertyNames = _Object$getOwnPropertyNames;