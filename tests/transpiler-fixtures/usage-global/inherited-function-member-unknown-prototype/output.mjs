import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// An unknown own key, spread or installed prototype prevents inherited-member narrowing.
// Every multi-family read keeps its conservative fallback.
use({
  [key]: other
}.toString.at);
use({
  ...other
}.valueOf.includes);
const box = {};
Object.setPrototypeOf(box, other);
use(box.hasOwnProperty.some);