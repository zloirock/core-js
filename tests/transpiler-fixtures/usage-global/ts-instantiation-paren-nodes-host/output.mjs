import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.function.name";
// under `createParenthesizedExpressions` the source parens are REAL nodes, so the host of an
// instantiation sits a paren layer up rather than directly overhead. every host decision has to
// climb those layers or it reads the paren as the host and does nothing - the type arguments then
// stay in front of `?.`, where the lowering that memoizes a receiver cannot see the callee
const f: any = (x: number) => x;
const g: any = (x: number) => x;
const o: any = {
  m: f
};
let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostCall = ((f || g))<string>(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostOptionalCall = ((o.m))?.<string>(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostNew = new ((f || g))<string>();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostTaggedTag = ((f || g))<string>`t`;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostMember = ((f || g)<string>).name;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostConditionalTest = ((q = f)<string>) ? 1 : 2;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingCast = ((f as any)<string>);
export const r = [hostCall, hostOptionalCall, hostNew, hostTaggedTag, hostMember, hostConditionalTest, tailFusingCast, [1, [2]].flat()];