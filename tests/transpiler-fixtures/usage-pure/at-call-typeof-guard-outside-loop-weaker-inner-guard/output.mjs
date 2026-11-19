import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// an outer typeof guard does not survive a loop that reassigns the binding on its back edge, even
// when a WEAKER guard on the same binding sits inside the loop: the inner test re-narrows nothing
// the outer one proved, so from iteration 2 the receiver may be the array `step` returned - both
// families inject. an inner guard IDENTICAL to the outer one re-narrows per iteration and keeps the
// string alone
export function f(value, steps) {
  if (typeof value === 'string') {
    for (const step of steps) {
      if (typeof value !== 'undefined') _at(value).call(value, 0);
      value = step(value);
    }
  }
}
export function g(value, steps) {
  if (typeof value === 'string') {
    for (const step of steps) {
      if (typeof value === 'string') _includesMaybeString(value).call(value, 'a');
      value = step(value);
    }
  }
}