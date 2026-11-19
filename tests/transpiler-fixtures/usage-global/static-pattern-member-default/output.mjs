import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A pattern-valued static keeps its inner default and member write.
export const box = {};
({
  from: {
    length: box.length = 9
  }
} = Array);