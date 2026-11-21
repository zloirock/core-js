import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
const log = [];
function make(change) {
  const holder = {
    items: [7]
  };
  if (change) holder.items = "abc";
  return holder;
}
const box = {
  __proto__: {
    get touch() {
      log.push("get");
      this.items = "xyz";
    }
  },
  items: [4],
  read() {
    return this.items.at(-1);
  }
};
const first = box.read();
void box.touch;
export const result = [make(false).items.at(0), make(true).items.at(0), first, box.read(), log];