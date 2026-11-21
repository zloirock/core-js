import _globalThis from "@core-js/pure/actual/global-this";
export function selected(pick) {
  const {
    Array: {
      prototype: {
        map
      }
    }
  } = pick && _globalThis;
  return map;
}