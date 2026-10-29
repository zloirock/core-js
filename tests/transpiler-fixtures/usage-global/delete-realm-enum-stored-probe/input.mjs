// Reading through a stored probe still observes absence before a later delete.
// The claimed enum hop must keep that write and its value.
enum RealmHop { SELF = 'self' }
let held;
// @ts-expect-error the realm field stands for an arbitrary user property
export const removed = delete (held = globalThis.window)[RealmHop.SELF].box.marker;
export { held };
