import "core-js/modules/es.array.at";
// @flow
// A rest parameter keeps the overload applicable beyond its fixed argument prefix.
declare class C {
  m(x: string, ...ys: number[]): number[],
  m(): string,
}
new C().m("x", 1).at(0);