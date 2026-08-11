import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// MAYBE-NARROW: a reassignment the resolver can ORDER narrows precisely - the call below it sees the
// later value, so the string-specific helper is right. a write it cannot order (a callback, a
// conditional, another function) must widen to the generic helper: a type-specific Maybe hands a
// foreign receiver that receiver's OWN method, absent on ie:11, and the emitted call then throws
let ordered = [1];
ordered = 'ab';
export const a = _atMaybeString(ordered).call(ordered, 0);
let viaCallback = [1];
[0].forEach(() => {
  viaCallback = 'ab';
});
export const b = _at(viaCallback).call(viaCallback, 0);
let conditional = [1];
if (c) conditional = 'ab';
export const d = _at(conditional).call(conditional, 0);
let viaFunction = [1];
function reassign() {
  viaFunction = 'ab';
}
export const e = _at(viaFunction).call(viaFunction, 0);