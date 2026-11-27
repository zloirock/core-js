// Unary numeric operators produce numbers, including when the operand is a string.
// Only the two explicit String reads use string helpers.
enum N {
  A = +'42',
  B = -3,
  C = ~0,
}
declare const v: N;
const tag = String(v);
tag.at(0);
tag.includes('A');
// @ts-expect-error probe a method absent from at least one enum member
typeof v.at;
