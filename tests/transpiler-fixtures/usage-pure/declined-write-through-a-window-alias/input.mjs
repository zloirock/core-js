// A write through an unbacked realm hop uses its proved alias as the write target.
const realm = globalThis;
realm.window.customSlot = 7;
export {};
