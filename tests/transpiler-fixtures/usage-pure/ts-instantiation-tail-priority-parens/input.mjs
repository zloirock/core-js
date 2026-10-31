// the second axis of the same slot: WHERE the instantiation sits, with a polyfilled static under it
// so the ponyfill substitution and the host decision meet. a host that ends the expression leaves a
// loose-but-not-fusing shape bare, and only a shape fusing on its own token keeps its parens
const g: any = (x: number) => x;
let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailValue = ((g || Object.groupBy)<any>);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailArgument = g(((g || Iterator.zip)<any>));
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingCast = ((Map.groupBy as any)<any>);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingUpdate = ((q++)<any>);
export const r = [tailValue, tailArgument, tailFusingCast, tailFusingUpdate];
