import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref;
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
const hostOptionalCall = ((o.m))<string>?.(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostNew = new ((f || g))<string>();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostTaggedTag = ((f || g))<string>`t`;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostMember = _nameMaybeFunction(((f || g)<string>));
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostConditionalTest = ((q = f)<string>) ? 1 : 2;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingCast = ((f as any)<string>);
export const r = [hostCall, hostOptionalCall, hostNew, hostTaggedTag, hostMember, hostConditionalTest, tailFusingCast, _flatMaybeArray(_ref = [1, [2]]).call(_ref)];