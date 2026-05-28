// `t[k]` where T's value-union is all string - dispatch narrows to `_atMaybeString`
function f<T extends { a: string; b: string }>(t: T, k: keyof T) {
  return t[k].at(0);
}
f({ a: 'x', b: 'y' }, 'a');
