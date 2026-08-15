import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
// the optional flag of a PARAMETER lives on the binding, not on its annotation, and
// `Parameters<typeof f>` carries it into the tuple element - both admit undefined on a call
// that omits the argument, so neither may fold to the annotated family alone
declare function take(items?: number[]): void;
declare const slot: Parameters<typeof take>[0];
export function read(items?: number[]) {
  var _ref;
  return _at(_ref = items ?? 'fallback').call(_ref, 0);
}
_includes(_ref2 = slot ?? 'fallback').call(_ref2, 'a');