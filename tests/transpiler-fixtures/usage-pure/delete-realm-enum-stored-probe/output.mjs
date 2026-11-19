import _globalThis from "@core-js/pure/actual/global-this";
// Reading through a stored probe still observes absence before a later delete.
// The claimed enum hop must keep that write and its value.
enum RealmHop {
  SELF = 'self'
}
let held;
// @ts-expect-error the realm field stands for an arbitrary user property
export const removed = delete (held = _globalThis.window).box.marker;
export { held };