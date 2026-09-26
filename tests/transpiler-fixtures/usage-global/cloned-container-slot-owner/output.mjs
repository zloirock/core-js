import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// Global-mode control: keep imports and reads while pure checks substitution ownership.
// Rewriting push clones its argument, including the container declarations inside it.
// The clone must retain its own slot writes, without borrowing a namesake's records.
export const values = [];
values.push((() => {
  const holder = {
    item: {
      slot: Array
    }.slot
  };
  holder.item = {
    from() {
      return [9];
    }
  };
  return holder.item.from([1, 2]);
})());
export function untouched() {
  const holder = {
    item: Array
  };
  return holder.item.from([3]);
}