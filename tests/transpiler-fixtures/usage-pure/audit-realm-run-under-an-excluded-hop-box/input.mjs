// A local box must not capture the same-named property of the realm.
const box = { self: {} };
export const deleteAboveDispatch = delete globalThis.self.box.list.at.name;
export const local = box.self;
