import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// Type arguments apply to the whole logical expression in a value, call argument or array element.
// The cast, angle assertion and postfix update also keep their grouping before the type arguments.
const f: any = (x: number) => x;
const g: any = (x: number) => x;
let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailValue = (f || g)<string>;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailArgument = g((f || g)<string>);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailElement = [(f || g)<string>];
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingCast = (f as any)<string>;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingAssertion = (<any> f)<string>;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingUpdate = (q++)<string>;
export const r = [tailValue, tailArgument, tailElement, tailFusingCast, tailFusingAssertion, tailFusingUpdate, [1, [2]].flat()];