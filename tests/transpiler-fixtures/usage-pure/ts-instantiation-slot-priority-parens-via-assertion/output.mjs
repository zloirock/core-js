import _Array$of from "@core-js/pure/actual/array/of";
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaAssertion = _Array$of<any>(1);
export const r = [viaAssertion];