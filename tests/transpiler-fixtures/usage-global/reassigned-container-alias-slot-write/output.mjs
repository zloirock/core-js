import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.iterator";
// A write through a reassigned holder reaches the aliased container's slot.
// The written constructor remains a possible receiver and supplies from.
let first = {
  x: Number
};
let second = {
  x: String
};
first = second;
first.x = Array;
const {
  x: {
    from
  }
} = second;