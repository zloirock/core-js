// `Extract<T, string>` with `T = string | number` must distribute over the union and pick `string`.
// Without distribution, the unresolvable union forces generic polyfills instead of String-specific ones.
function pick<T>(v: Extract<T, string>): typeof v {
  return v;
}
const r = pick<string | number>('a');
r.at(0);
r.includes('x');
