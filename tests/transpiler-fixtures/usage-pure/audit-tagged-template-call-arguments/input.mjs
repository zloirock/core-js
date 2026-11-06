// a tagged template IS a call - it hands its tag the strings ARRAY and then the interpolations -
// so the arguments an overload set and a generic signature are matched against come from `quasi`,
// not from an absent `arguments` slot. the overloaded row is refuted by arity down to one arm, the
// generic row binds its parameter from the real interpolation instead of the declared default, and
// the last row reads the strings argument itself, which is an array however the quasi is spelled
declare function tag(s: TemplateStringsArray): string;
declare function tag(s: TemplateStringsArray, a: number, b: number): number[];
export const a = tag`x${1}${2}`.at(0);
declare function generic<T = number[]>(s: TemplateStringsArray, a: T): T;
export const b = generic`x${"y"}`.at(0);
function readStrings(s: readonly string[]) {
  return s.at(0);
}
export const c = readStrings`x`;
