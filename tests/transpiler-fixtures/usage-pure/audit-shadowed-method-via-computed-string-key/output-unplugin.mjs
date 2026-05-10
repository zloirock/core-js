// computed-key write `obj['at'] = ...` shadows the same method later read via
// non-computed access; the shadow detection must compare key-by-value across
// computed-string-literal vs identifier shapes
const obj = { at: () => 0 };
obj['at'] = (x) => x + 1;
obj.at(0);