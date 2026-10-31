// the all-proxy run a claimless navigation folds stops below a realm hop whose slot holds the
// user's object - but a hop read BEFORE the file writes its slot still reads the realm, so the run
// climbs past it and folds whole, the spelling its write-free twin gets
const realm = () => globalThis;
export const deletedAhead = delete realm().self.window.deletedSlot;
delete globalThis.window;
