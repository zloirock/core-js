import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A replaced static remains the source of the nested pattern.
Array.from = {
  length: 19
};
export let length;
({
  from: {
    length = 9
  }
} = Array);