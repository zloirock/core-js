import "core-js/modules/es.array.at";
import "core-js/modules/es.string.strike";
const fn = () => ['a', 'b'];
const obj = {
  get items() {
    switch (this.mode) {
      case 1:
        return fn;
      case 2:
        return fn;
      default:
        return fn;
    }
  }
};
obj.items().at(0).strike();