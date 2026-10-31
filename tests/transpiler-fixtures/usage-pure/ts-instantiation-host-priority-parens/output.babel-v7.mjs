import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$try from "@core-js/pure/actual/promise/try";
// the second axis of the same slot: WHERE the instantiation sits, with a polyfilled static under it
// so the ponyfill substitution and the host decision meet. a host that can carry the type arguments
// itself takes them and the node folds away - which is also how the plain `Array.from<T>(x)` spelling
// already reads
const g: any = (x: number) => x;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostCall = (g || _Array$from)<any>([1, [2]]);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostNew = new (g || _Array$from)<any>();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostOptionalCall = (g || _Array$of)<any>?.(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostTaggedTag = (g || _Array$from)<any>`t`;
// the gap before `?.` may hold a comment, and one carrying `?.` of its own must not be mistaken
// for the token: the type arguments move past the REAL one, and the comment stays put
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostOptionalCallPastComment = (g || _Promise$try /* a ?. b */)<any>?.(g);
// several folds in one file, and folds nested inside one another's span: the edits are point
// edits on type-only text, so they neither collide nor renumber each other
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostTwoInOneLine = [(g || _Array$of)<any>?.(1), (g || _Array$from)<any>?.([2])];
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostFoldInsideFold = (g || _Array$from)<any>?.((g || _Array$of)<any>?.(3));
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostFoldInReceiver = ((g || _Array$of)<any>?.(4) as any)?.(5);
export const r = [hostCall, hostNew, hostOptionalCall, hostTaggedTag, hostOptionalCallPastComment, hostTwoInOneLine, hostFoldInsideFold, hostFoldInReceiver];