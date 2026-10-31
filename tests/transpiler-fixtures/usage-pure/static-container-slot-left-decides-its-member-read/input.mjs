// a member read off a `||` / `??` whose left reads a static container's slot holding a constructor - spelled bare
// or read off the realm - never runs the right: it reads the static off that constructor and imports nothing for
// the right. a slot a write may reach keeps the selection and its guard
const box = { U: Map };
const realm = { M: globalThis.Map };
const held = { M: Map };
if (globalThis.reset) held.M = null;
export const viaSlot = (box.U || Object).groupBy;
export const viaRealmSlot = (realm.M ?? Object).groupBy;
export const viaHeldSlot = (held.M || Object).groupBy;
