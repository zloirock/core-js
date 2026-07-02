import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Identity<Source>['fruits']` indexes into an identity-mapped wrapper; passthrough must keep array shape.
// Indexed access has to compose cleanly with mapped-type expansion, otherwise the array narrow is lost.
type Source = {
  fruits: string[];
  counts: number[];
};
type Identity<T> = { [K in keyof T]: T[K] };
declare const m: Identity<Source>['fruits'];
_atMaybeArray(m).call(m, 0);