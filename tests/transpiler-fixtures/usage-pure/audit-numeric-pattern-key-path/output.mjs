import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a NUMERIC pattern key names a container slot exactly as its string spelling does, so the
// key-path walk resolves it - the read side always named it, and the two disagreeing was the
// asymmetry.
const holder = {
  0: _globalThis
};
const {
  0: viaNumber
} = holder;
export const from = _Array$from([1]);
const stringHolder = {
  0: _globalThis
};
const {
  '0': viaString
} = stringHolder;
export const of = _Array$of(1);