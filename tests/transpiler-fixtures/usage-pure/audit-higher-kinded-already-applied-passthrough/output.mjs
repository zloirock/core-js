import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// HKT bound that is ALREADY applied: `Wrap<F> = F<number>; Already = Wrap<Array<string[]>>`.
// the typeparam F binds to `Array<string[]>` (a $Object('Array', $Object('Array', 'string'))
// with inner already set). the `bound.inner !== null` gate must skip the rebuild - otherwise
// the X type-arg (`number`) would clobber the nested-array inner. with the gate, the bound
// stays Array<string[]> and the first at() narrows to the inner Array; the chained at()
// then sees an Array surface again and emits the array-narrow helper (not the generic _at
// fallback that a clobbered Array<number> would force on the second hop).
type Wrap<F> = F<number>;
type Already = Wrap<Array<string[]>>;
declare const xs: Already;
_atMaybeArray(_ref = _atMaybeArray(xs).call(xs, 0)).call(_ref, 0);