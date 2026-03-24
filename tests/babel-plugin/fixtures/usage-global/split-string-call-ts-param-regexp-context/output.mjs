import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.dot-all";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.regexp.sticky";
import "core-js/modules/es.string.split";
function foo(x: RegExp) {
  'hello'.split(x);
}