import _Array$from from "@core-js/pure/actual/array/from";
// The binding store survives receiver narrowing and still runs on the nullish branch.
export function read(choice, effect) {
  const A = choice ? Array : null;
  let held;
  const value = (effect(), held = A, null == held ? void 0 : held === Array ? _Array$from([3]) : held.from([3]));
  return [value, held];
}