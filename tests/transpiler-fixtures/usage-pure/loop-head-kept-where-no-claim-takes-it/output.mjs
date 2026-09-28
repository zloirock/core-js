import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// A loop head or catch pattern is moved into the body only for a claim the moved declaration then
// serves: an instance slot beside rest stays native, a method value carries no instance method,
// and a defaulted element keeps its slot, so those heads print as written. The last head serves.
for (const {
  at,
  ...rest
} of list) use(at, rest);
for (const {
  w: {
    keys
  }
} of [{
  w() {
    return 1;
  }
}]) use(keys);
for (const [{
  findLast = fallback
}] of list) use(findLast);
try {
  risky();
} catch ({
  includes,
  ...others
}) {
  use(includes, others);
}
for (const _ref3 of list) {
  const flatMap = _flatMapMaybeArray(_ref3.w);
  use(flatMap);
}