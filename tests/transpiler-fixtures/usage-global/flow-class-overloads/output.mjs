import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// @flow
// Bodyless overloads select by call arguments instead of choosing the last declaration.
declare class C {
  m(x: string): string,
  m(x: string, y: number): number[],
}
new C().m("x").at(0);
new C().m("x", 1).includes(1);