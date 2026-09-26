// a subclass redeclares a same-named field, shadowing base's annotation. dispatch on a
// subclass instance must read the SUBCLASS annotation, not base's: base is `bag: number[]`
// but subclass is `bag: { length: number }` (no array shape). so `s.bag.at(0)` /
// `s.bag.includes(1)` bail to GENERIC `_at` / `_includes`, not the `MaybeArray` variants
class Base {
  bag: number[] = [];
}
class Sub extends Base {
  bag: { length: number } = { length: 0 };
}
declare const s: Sub;
s.bag.at(0);
s.bag.includes(1);
