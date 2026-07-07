import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global array-wrapper receiver walk read-site. a value captured into a wrapper array is fixed when
// the array literal is EVALUATED, so a reassignment of the source binding AFTER that capture cannot change
// it - the walk keeps resolving `holder[0]` to Map and injects es.map.group-by. the reassignment check must
// anchor on the wrapper binding's declarator (the capture point), not the final destructure read: a
// host-anchored check saw the later reassignment as dominating and wrongly bailed the first case.
// contrast: reassigning BEFORE the capture DOES change the captured value, so es.object.group-by bails
let capturedMap = globalThis.Map;
const holder = [capturedMap];
capturedMap = {};
const [{
  groupBy
}] = holder;
let changedObject = globalThis.Object;
changedObject = {};
const box = [changedObject];
const [{
  groupBy: objectGroupBy
}] = box;
export { groupBy, objectGroupBy };