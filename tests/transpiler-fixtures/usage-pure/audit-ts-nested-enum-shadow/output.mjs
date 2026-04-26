// nested `enum X {}` and `namespace X {}` declarations shadow globals from inside the
// enclosing function / namespace body, but neither babel scope nor estree-toolkit register
// them as bindings. the path-based body scan walks function/block/TSModuleBlock anchors
// upward to detect the shadow before polyfill emission
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