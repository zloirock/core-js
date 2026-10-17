// a DUAL name (a static and an instance method alike: `entries`, `keys`, `values`) under a hop is the
// mirror's claim like a static-only one: the relocation that minted a host for it read the leaf
// typelessly as an instance method and lost the constructor's name (`_entries(_ref.w)`)
for (const { w: { entries: viaDualHop } } of [{ w: Object }]) viaDualHop;
