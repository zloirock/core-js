const arr2 = [3, [4]];
const holder = { arr: arr2 };
export const viaMemberSingleProp = (function ({ at } = holder.arr) {
  return typeof at;
})();
