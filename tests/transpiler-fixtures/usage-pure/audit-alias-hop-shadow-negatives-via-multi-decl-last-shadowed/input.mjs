// The last var initializer wins; no guard may revive the earlier constructor.
const multiRoot = Promise;
export function viaMultiDeclLastShadowed() {
  { var multiHeld = multiRoot; }
  { const multiRoot = {}; var multiHeld = multiRoot; }
  { const { allSettled } = multiHeld; return allSettled([]); }
}
