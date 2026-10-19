// 3-hop alias chain over a Promise<number[] | string>; the unfoldable union forces a fallback path.
// Body-inference of `Promise.resolve([...])` must recover the array shape so `.includes` narrows precisely.
type DeepInner<X> = Promise<X | string>;
type DeepMid<X> = DeepInner<X>;
type DeepOuter<X> = DeepMid<X>;
async function probe(): Promise<DeepOuter<number[]>> {
  return Promise.resolve([1, 2, 3]);
}
const result = await probe();
// @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
result.includes('foo');
export {};
