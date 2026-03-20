import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
function f(o: {
  includes: Function;
}) {
  o.includes(x);
}