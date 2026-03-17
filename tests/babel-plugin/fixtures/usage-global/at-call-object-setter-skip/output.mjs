import "core-js/modules/es.array.at";
const obj = {
  get items() {
    return ['a', 'b'];
  },
  set items(v) {
    console.log(v);
  }
};
obj.items.at(0);