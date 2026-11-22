import _Array$from from "@core-js/pure/actual/array/from";
// The member reads its static from the Array installed in the slot.
const cm = {
  s: Object
};
cm.s = Array;
export const viaMemberRead = _Array$from([1]);