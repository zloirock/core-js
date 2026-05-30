import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// ambient `var` inside a `declare global` block is namespace-scoped and tsc-elided,
// so it must not suppress the polyfill for the real global used outside the block
declare global {
  var Map: any;
}
new Map();