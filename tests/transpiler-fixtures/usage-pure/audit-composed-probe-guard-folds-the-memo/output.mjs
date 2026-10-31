import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// A receiver split composes with the existing environment probe without adding a second guard.
// The unwritten computed key retains the constructor alone; the named static remains independent.
let out;
let k;
out = null == (() => _globalThis)().window ? void 0 : _nameMaybeFunction(_Promise$race.zzz);
export const read = out;
export const keyed = null == (() => _globalThis)().window ? void 0 : _at(_Promise[k]);