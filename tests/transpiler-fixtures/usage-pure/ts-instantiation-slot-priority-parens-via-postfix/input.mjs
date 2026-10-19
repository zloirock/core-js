let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaPostfix = ((q++)<any>)(1);
export const r = [viaPostfix];
