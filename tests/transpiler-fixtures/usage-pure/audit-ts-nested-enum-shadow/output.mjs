// nested `enum X {}` and `namespace X {}` declarations shadow globals from inside the
// enclosing function / namespace body, but TS-only declarations are not registered as
// bindings by the standard scope analyses. A separate body scan walks function/block/
// namespace anchors upward to detect the shadow before polyfill emission
export function viaFunction() {
  enum Map {
    A = 1,
  }
  return new Map();
}
export namespace ViaNamespace {
  namespace WeakMap {
    export const x = 1;
  }
  export const v = new WeakMap();
}