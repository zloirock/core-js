import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyDescriptors from "@core-js/pure/actual/object/get-own-property-descriptors";
// Wrapped proxy-global destructure sources stay owned by the destructure path. The sequence default
// keeps its effect, the local truthy conditional decides Object, and the TS cast resolves Object
// directly; no dead proxy-root import may leak. An unknown container selection remains covered by
// `container-chosen-by-undecided-selection-mirrors-under-a-pattern`.
function eff() {}
function seSource({
  from,
  of
} = (eff(), {
  from: _Array$from,
  of: _Array$of
})) {
  // @ts-expect-error arithmetic tsc refuses is the shape under test
  return from([1]) + of(2, 3);
}
const useGlobal = 1;
const objFallback = {
  fromEntries() {}
};
const fromEntries = _Object$fromEntries;
const getOwnPropertyDescriptors = _Object$getOwnPropertyDescriptors;
getOwnPropertyDescriptors({
  a: 1
});
export { seSource, fromEntries };