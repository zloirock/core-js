// the deleted member sits ABOVE an instance dispatch, so the members below it keep their claims and
// the collapse stops at the dispatch: the delete applies to the dispatched value, and over a probe the
// guard takes the whole operator, so the absent branch answers `true` and deletes nothing.
globalThis.box = { list: [[1]] };
export const deleteAboveDispatch = delete globalThis.self.box.list.at.name;
export const deleteAboveDispatchProbe = delete globalThis.window?.self.box.list.includes.name;
export const deleteAboveDispatchPlainTail = delete globalThis.window?.self.box.list.concat.customUserKey;
