function realm() { return globalThis; }
for (var before = effect('before'), { Array: { prototype: { flat }, isArray } } = (effect('prefix'), realm()), after = effect('after');;) {
  use(before, flat, isArray, after);
  break;
}
