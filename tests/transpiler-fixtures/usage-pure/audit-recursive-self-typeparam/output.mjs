import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Self-referential alias `type R<T = R<string[]>>` with cycle through default value.
// Cycle detection must bail to generic instance polyfill rather than infinite-recurse on the default.
type R<T = R<string[]>> = {
  val: T;
};
declare const x: R;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(_ref = x.val).call(_ref, 0);