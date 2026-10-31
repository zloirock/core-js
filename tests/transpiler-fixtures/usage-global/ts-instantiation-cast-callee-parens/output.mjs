const M = {
  groupBy: (x: unknown) => x
};
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
(M.groupBy as any)<any>([1]);