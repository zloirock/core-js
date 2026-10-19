// the second axis of the same slot: WHERE the instantiation sits, with a polyfilled static under it
// so the ponyfill substitution and the host decision meet. a host that ends the expression leaves a
// loose-but-not-fusing shape bare, and only a shape fusing on its own token keeps its parens
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";

const g: any = (x: number) => x;
let q: any;

// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailValue = (g || _Object$groupBy)<any>;

// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailArgument = g((g || _Iterator$zip)<any>);

// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingCast = _Map$groupBy;

// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tailFusingUpdate = (q++)<any>;

export const r = [tailValue, tailArgument, tailFusingCast, tailFusingUpdate];