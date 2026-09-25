import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// a container slot the file wrote no longer holds the literal's type: an instance method read through
// a pattern write, a slot of a pattern alias or the literal a call yields dispatches generically in pure
// and injects every family in usage-global - the member spelling's answer - so a string written over an
// array literal, and an array written over a string literal, each reach their own polyfill
const box = {
  a: [1, 2]
};
box.a = 'ab';
let viaWrite = [];
({
  a: viaWrite
} = box);
export const last = _at(viaWrite).call(viaWrite, -1);
const list = [[1, 2]];
list[0] = 'cd';
const [alias] = [list];
const [viaAlias] = alias;
export const has = _includes(viaAlias).call(viaAlias, 'd');
const make = () => ({
  f: 'ef'
});
const made = make();
made.f = [[1], [2]];
export const flat = _flatMaybeArray(_ref = made.f).call(_ref);