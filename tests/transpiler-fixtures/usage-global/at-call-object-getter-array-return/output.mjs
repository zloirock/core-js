import "core-js/modules/es.array.at";
const obj = {
  get items() {
    return [1, 2, 3];
  }
};
obj.items.at(-1);