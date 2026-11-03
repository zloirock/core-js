import _includes from "@core-js/pure/actual/instance/includes";
// A local object's same-named slot can leave an array element undefined.
export function read(globalThis) {
  const [_ref = [13]] = [globalThis.window],
    includes = _includes(_ref);
  return includes;
}