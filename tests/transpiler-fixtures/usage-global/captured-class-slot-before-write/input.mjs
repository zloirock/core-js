// Global-mode control: keep imports and reads while pure checks substitution ownership.
// A captured static value survives later writes to its container, including when push clones
// the whole capture. The read must keep its Array.from polyfill in a stripped realm.
export const values = [];
values.push((() => {
  class Box { static item = Array; }
  const item = Box.item;
  Box.item = {};
  return item.from([1, 2]);
})());
