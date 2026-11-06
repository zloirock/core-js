import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
function fn(x) {
  if (!(x instanceof globalThis.Array)) x.at(0);
}