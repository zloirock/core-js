import "core-js/modules/es.array.at";
// object getter/setter pair conceals the actual stored type behind accessor calls; type-driven
// dispatch bails but generic Array.prototype.at polyfill still applies via the getter return
const obj = {
  get items() {
    return ['a', 'b'];
  },
  set items(v) {
    console.log(v);
  }
};
obj.items.at(0);