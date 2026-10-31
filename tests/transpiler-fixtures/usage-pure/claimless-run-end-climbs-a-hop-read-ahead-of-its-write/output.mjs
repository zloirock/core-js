import _globalThis from "@core-js/pure/actual/global-this";
// the all-proxy run a claimless navigation folds stops below a realm hop whose slot holds the
// user's object - but a hop read BEFORE the file writes its slot still reads the realm, so the run
// climbs past it and folds whole, the spelling its write-free twin gets
const realm = () => _globalThis;
export const deletedAhead = delete _globalThis.deletedSlot;
delete _globalThis.window;