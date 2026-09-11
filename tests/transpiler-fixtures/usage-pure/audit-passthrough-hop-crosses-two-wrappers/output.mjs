import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// one passthrough hop can cross SEVERAL wrappers: the `Awaited<>` walker peels through
// structure-preserving wrappers on its own, so reading only the outermost answers for neither
interface I {
  items: number[];
  tags?: number[];
}
declare const viaPartial: Awaited<Partial<I>>;
declare const viaRequired: Awaited<Required<I>>;
const fromPartial = viaPartial.items;
const fromRequired = viaRequired.tags;
_at(_ref = fromPartial ?? 'fallback').call(_ref, 0);
_includesMaybeArray(fromRequired).call(fromRequired, 1);