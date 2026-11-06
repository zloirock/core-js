import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
const copied = {
  nums: [1],
  pick() {
    return this.nums.at(1);
  }
};
const twin = {
  ...copied,
  nums: 'xy'
};
twin.pick();