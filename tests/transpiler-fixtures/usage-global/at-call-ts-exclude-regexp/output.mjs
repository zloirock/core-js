import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.dot-all";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.sticky";
import "core-js/modules/es.string.at";
function foo(x: Exclude<string | RegExp, object>) {
  x.at(0);
}