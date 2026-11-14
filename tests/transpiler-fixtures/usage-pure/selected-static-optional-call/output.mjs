import _Array$from from "@core-js/pure/actual/array/from";
// Both the receiver and its method can short-circuit independently.
export function read(choice) {
  const A = choice ? Array : null;
  return null == A ? void 0 : A === Array ? _Array$from([3]) : A.from?.([3]);
}