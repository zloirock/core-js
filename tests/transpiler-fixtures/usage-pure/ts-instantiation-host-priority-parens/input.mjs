// the second axis of the same slot: WHERE the instantiation sits, with a polyfilled static under it
// so the ponyfill substitution and the host decision meet. a host that can carry the type arguments
// itself takes them and the node folds away - which is also how the plain `Array.from<T>(x)` spelling
// already reads; a host that keeps reading after them needs the parens; the rest end the expression
const g: any = (x: number) => x;
let q: any;
const hostCall = ((g || Array.from)<any>)([1, [2]]);
const hostNew = new ((g || Array.from)<any>)();
const hostOptionalCall = ((g || Array.of)<any>)?.(1);
const hostTaggedTag = ((g || Array.from)<any>)`t`;
// the gap before `?.` may hold a comment, and one carrying `?.` of its own must not be mistaken
// for the token: the type arguments move past the REAL one, and the comment stays put
const hostOptionalCallPastComment = ((g || Promise.try)<any>) /* a ?. b */ ?.(g);
// several folds in one file, and folds nested inside one another's span: the edits are point
// edits on type-only text, so they neither collide nor renumber each other
const hostTwoInOneLine = [((g || Array.of)<any>)?.(1), ((g || Array.from)<any>)?.([2])];
const hostFoldInsideFold = ((g || Array.from)<any>)?.(((g || Array.of)<any>)?.(3));
const hostFoldInReceiver = ((((g || Array.of)<any>)?.(4)) as any)?.(5);
const hostMember = ((g || Array.from)<any>).name;
const hostComputedMember = ((g || Array.of)<any>)[0];
const hostConditionalTest = ((q = Promise.allSettled)<any>) ? 1 : 2;
// hosts that end the expression: a loose-but-not-fusing shape keeps no parens, a fusing one does
const tailValue = ((g || Object.groupBy)<any>);
const tailArgument = g(((g || Iterator.zip)<any>));
const tailFusingCast = ((Map.groupBy as any)<any>);
const tailFusingUpdate = ((q++)<any>);
export const r = [hostCall, hostNew, hostOptionalCall, hostTaggedTag, hostOptionalCallPastComment, hostTwoInOneLine, hostFoldInsideFold, hostFoldInReceiver, hostMember, hostComputedMember,
  hostConditionalTest, tailValue, tailArgument, tailFusingCast, tailFusingUpdate];
