import _Array$from from "@core-js/pure/actual/array/from";
// A nullable constructor guards its static call and the continuing member.
export function read(choice) {
  const A = choice ? Array : null;
  return null == A ? void 0 : (A === Array ? _Array$from([3]) : A.from([3])).length;
}