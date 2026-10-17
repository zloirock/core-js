// Wrapped proxy-global destructure sources stay owned by the destructure path. The sequence default
// keeps its effect, the local truthy conditional decides Object, and the TS cast resolves Object
// directly; no dead proxy-root import may leak. An unknown container selection remains covered by
// `container-chosen-by-undecided-selection-mirrors-under-a-pattern`.
function eff() {}
function seSource({ from, of } = (eff(), globalThis.window.self.Array)) {
  return from([1]) + of(2, 3);
}
const useGlobal = 1;
const objFallback = { fromEntries() {} };
const { fromEntries } = useGlobal ? globalThis.self.Object : objFallback;
const { getOwnPropertyDescriptors } = (globalThis.self.Object as any);
getOwnPropertyDescriptors({ a: 1 });
export { seSource, fromEntries };
