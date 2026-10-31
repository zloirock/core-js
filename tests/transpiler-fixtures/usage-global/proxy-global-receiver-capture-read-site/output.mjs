import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global proxy-global receiver walk read-site, resolved through a synthesized member value. a
// destructure whose reaching value is a receiver member (`wrapper.proxy.Array`, `source.Map`) synthesizes
// that member node during resolution; it must carry the source position so a reassignment-dominance check
// anchors at the CAPTURE read (where the proxy root was destructured), not the final host use. a
// positionless synthetic node fell back to the host and wrongly bailed a reassign-after-capture root.
// first cell: a proxy-global nested in an object wrapper; second: an assignment-form receiver destructure
let root = globalThis;
const wrapper = {
  proxy: root
};
root = {};
const {
  proxy: {
    Array
  }
} = wrapper;
Array.from([1]);
let source = globalThis;
let boxed;
({
  Map: boxed
} = source);
source = {};
boxed.groupBy([], () => 0);