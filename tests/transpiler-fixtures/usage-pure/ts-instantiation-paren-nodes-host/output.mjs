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
const hostCall = ((f || g))<string>(1);
const hostOptionalCall = ((o.m))?.<string>(1);
const hostNew = new ((f || g))<string>();
const hostTaggedTag = ((f || g))<string>`t`;
const hostMember = _nameMaybeFunction(((f || g)<string>));
const hostConditionalTest = ((q = f)<string>) ? 1 : 2;
const tailFusingCast = ((f as any)<string>);
export const r = [hostCall, hostOptionalCall, hostNew, hostTaggedTag, hostMember, hostConditionalTest, tailFusingCast, _flatMaybeArray(_ref = [1, [2]]).call(_ref)];