import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$try from "@core-js/pure/actual/promise/try";
// the second axis of the same slot: WHERE the instantiation sits, with a polyfilled static under it
// so the ponyfill substitution and the host decision meet. a host that can carry the type arguments
// itself takes them and the node folds away - which is also how the plain `Array.from<T>(x)` spelling
// already reads; a host that keeps reading after them needs the parens; the rest end the expression
const g: any = (x: number) => x;
let q: any;
const hostCall = (g || _Array$from)<any>([1, [2]]);
const hostNew = new (g || _Array$from)<any>();
const hostOptionalCall = (g || _Array$of)?.<any>(1);
const hostTaggedTag = (g || _Array$from)<any>`t`;
// the gap before `?.` may hold a comment, and one carrying `?.` of its own must not be mistaken
// for the token: the type arguments move past the REAL one, and the comment stays put
const hostOptionalCallPastComment = (g || _Promise$try /* a ?. b */)?.<any>(g);
// several folds in one file, and folds nested inside one another's span: the edits are point
// edits on type-only text, so they neither collide nor renumber each other
const hostTwoInOneLine = [(g || _Array$of)?.<any>(1), (g || _Array$from)?.<any>([2])];
const hostFoldInsideFold = (g || _Array$from)?.<any>((g || _Array$of)?.<any>(3));
const hostFoldInReceiver = ((g || _Array$of)?.<any>(4) as any)?.(5);
const hostMember = _nameMaybeFunction(g || _Array$from<any>);
const hostComputedMember = ((g || _Array$of)<any>)[0];
const hostConditionalTest = (q = _Promise$allSettled)<any> ? 1 : 2;
// hosts that end the expression: a loose-but-not-fusing shape keeps no parens, a fusing one does
const tailValue = g || _Object$groupBy<any>;
const tailArgument = g(g || _Iterator$zip<any>);
const tailFusingCast = _Map$groupBy;
const tailFusingUpdate = (q++)<any>;
export const r = [hostCall, hostNew, hostOptionalCall, hostTaggedTag, hostOptionalCallPastComment, hostTwoInOneLine, hostFoldInsideFold, hostFoldInReceiver, hostMember, hostComputedMember, hostConditionalTest, tailValue, tailArgument, tailFusingCast, tailFusingUpdate];