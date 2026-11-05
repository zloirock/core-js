// After a static is replaced with its ponyfill, the type arguments still apply to the whole
// logical expression in a value or call argument. A postfix update also retains its grouping.
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
