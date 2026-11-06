import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
export function inForOfLeftDefault(items) {
  let kLeft = "parseFloat";
  for (const {
    m = Number[kLeft]("1.5")
  } of items) {
    kLeft = "isInteger";
  }
}