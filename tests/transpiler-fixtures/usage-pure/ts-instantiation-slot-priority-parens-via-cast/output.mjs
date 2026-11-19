import _Array$from from "@core-js/pure/actual/array/from";
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaCast = _Array$from<any>([1]);
export const r = [viaCast];