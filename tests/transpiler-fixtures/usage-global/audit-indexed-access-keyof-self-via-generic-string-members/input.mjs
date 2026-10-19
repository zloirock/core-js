// `t[k]` where `k: keyof T` over a constraint whose named members are all strings: a subtype
// may still add a key of another family, so the read stays generic rather than string-narrow
function f<T extends { a: string; b: string }>(t: T, k: keyof T) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return t[k].at(0);
}
f({ a: 'x', b: 'y' }, 'a');
