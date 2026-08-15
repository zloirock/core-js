import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a modifier wrapper over a TUPLE changes its elements exactly as it changes an object's
// members, and the tuple walk peels the wrapper in two places of its own - `Partial<>` makes
// the slot admit undefined, `Required<>` takes an element's own `?` back off
type Pair = [number[], string];
type Opt = [string, number[]?];
declare const fromPartial: Partial<Pair>[0];
declare const fromRequired: Required<Opt>[1];
_at(_ref = fromPartial ?? 'fallback').call(_ref, 0);
_includesMaybeArray(_ref2 = fromRequired ?? 'fallback').call(_ref2, 1);