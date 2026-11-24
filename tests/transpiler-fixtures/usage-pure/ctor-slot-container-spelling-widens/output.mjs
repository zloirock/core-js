// A user object with the same slot spelling has no constructor entry.
const plainSource = {
  Map: {}
};
const plainHop = plainSource;
const {
  Map: {
    groupBy: viaPlainSlot
  },
  ...plainRest
} = plainHop;
export { viaPlainSlot, plainRest };