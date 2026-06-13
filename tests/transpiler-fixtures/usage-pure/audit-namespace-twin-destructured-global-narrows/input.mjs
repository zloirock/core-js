const { Array: A } = globalThis;
namespace N {
  const A = 1;
}
export const r = A.from([1]).at(0);
