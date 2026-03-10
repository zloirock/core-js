import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.dot-all";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.sticky";
import "core-js/modules/es.string.match";
function foo(pattern: RegExp) {
  'hello'.match(pattern);
}