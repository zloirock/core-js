// T has no constraint - no member info available, fold bails, dispatch stays generic
function f<T>(t: T, k: keyof T) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return t[k].at(0);
}
f({ a: 'x' }, 'a');
