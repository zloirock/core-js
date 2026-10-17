import _Promise from "@core-js/pure/actual/promise";
// The last var initializer wins; no guard may revive the earlier constructor.
const multiRoot = _Promise;
export function viaMultiDeclLastShadowed() {
  {
    var multiHeld = multiRoot;
  }
  {
    const multiRoot = {};
    var multiHeld = multiRoot;
  }
  {
    const {
      allSettled
    } = multiHeld;
    return allSettled([]);
  }
}