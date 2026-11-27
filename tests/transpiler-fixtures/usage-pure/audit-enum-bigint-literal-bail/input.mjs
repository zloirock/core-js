// String conversion and a direct enum operand exercise different receiver decisions.
enum Bag {
  // @ts-expect-error an enum member tsc refuses is the shape under test
  Big = 100n,
  // @ts-expect-error an enum member tsc refuses is the shape under test
  Small = 1n,
}
declare const v: Bag;
const tag = String(v);
tag.at(0);
tag.includes('1');
// @ts-expect-error probe a method absent from at least one enum member
typeof v.at;
