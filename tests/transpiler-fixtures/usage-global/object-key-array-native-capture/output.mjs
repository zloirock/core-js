import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A named object key selects an array before native iteration selects its receiver.
// Preserve both selections and inject the instance method for the captured value.
export const {
  w: [{
    at
  }]
} = {
  w: [[4, 8]]
};