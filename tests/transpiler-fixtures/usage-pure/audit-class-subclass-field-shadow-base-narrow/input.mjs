// a subclass redeclares a same-named field, shadowing base's annotation. dispatch on a
// subclass instance must read the SUBCLASS annotation, not base's: base is `bag: number[]`
// but subclass is `bag: { length: number }` (no array shape). so `s.bag.at(0)` /
// `s.bag.includes(1)` bail to GENERIC `_at` / `_includes`, not the `MaybeArray` variants
class Base {
  bag: number[] = [];
}
class Sub extends Base {
  // @ts-expect-error a heritage tsc refuses is the shape under test
  bag: { length: number } = { length: 0 };
}
declare const s: Sub;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
s.bag.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
s.bag.includes(1);
