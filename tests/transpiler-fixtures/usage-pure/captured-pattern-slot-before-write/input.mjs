// A captured static value survives later writes to its container, including when push clones
// the whole capture. The read must keep its Array.from polyfill in a stripped realm.
export const values = [];
values.push((() => {
  const box = { item: Array };
  const alias = box;
  const { item } = alias;
  box.item = {};
  return item.from([1, 2]);
})());
