import _globalThis from "@core-js/pure/actual/global-this";
// A write through an unbacked realm hop uses its proved alias as the write target.
const realm = _globalThis;
realm.customSlot = 7;
export {};