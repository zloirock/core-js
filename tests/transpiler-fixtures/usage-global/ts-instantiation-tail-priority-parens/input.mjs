// the second axis of the same slot: WHERE the instantiation sits. a host that ends the expression - a
// value, an argument, an element - leaves a loose-but-not-fusing shape bare, and only a shape fusing on
// its own token keeps its parens: they are spelled as a node later lowerings must accept, so they are
// only added where owed
const f: any = (x: number) => x;
const g: any = (x: number) => x;
let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailValue = ((f || g)<string>);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailArgument = g(((f || g)<string>));
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailElement = [((f || g)<string>)];
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingCast = ((f as any)<string>);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingAssertion = ((<any>f)<string>);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingUpdate = ((q++)<string>);
export const r = [tailValue, tailArgument, tailElement, tailFusingCast, tailFusingAssertion, tailFusingUpdate, [1, [2]].flat()];
