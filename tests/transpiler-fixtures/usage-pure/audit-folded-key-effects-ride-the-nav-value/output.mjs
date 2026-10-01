import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _self from "@core-js/pure/actual/self";
// a navigation whose collapsed hop carries a COMPUTED key with effects still spells as a VALUE: the
// key effects replay ahead of the ponyfill leaf, in the order native evaluates them. turned away from
// the value form, the same navigation every other spelling folds earned an environment probe instead
let v, g, out;
function eff() {}
out = _nameMaybeFunction((g = _globalThis, v = (eff(), _self), _Promise$race).zzz);
export const read = out;