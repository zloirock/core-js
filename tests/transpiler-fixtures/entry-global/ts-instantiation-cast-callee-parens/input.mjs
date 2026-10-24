import "core-js/es/array/at";
const M = {
  g: (x: unknown) => x
};
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
((M.g as any)<any>)([1]);
