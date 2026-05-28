// T has no constraint - no member info available, fold bails, dispatch stays generic
function f<T>(t: T, k: keyof T) {
  return t[k].at(0);
}
f({ a: 'x' }, 'a');
