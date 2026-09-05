import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `NonNullable<Renamed<Source>['_items']>` peels null off a mapped-and-renamed member's value.
// Mapped expansion must surface the member so NonNullable can drop the null arm cleanly.
type Source = {
  items: number[] | null;
};
type Renamed<T> = { [K in keyof T as `_${K & string}`]: T[K] };
type Member = NonNullable<Renamed<Source>['_items']>;
declare const m: Member;
_includesMaybeArray(m).call(m, 1);