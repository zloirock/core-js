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
// usage-global static-receiver walk read-site through a container. a value captured into an object literal
// (or class static) is fixed when the container is EVALUATED, so a reassignment of the source binding AFTER
// that capture cannot change it - the walk keeps resolving `holder.Map` to Map and injects es.map.group-by.
// the reassignment check must anchor on the CONTAINER's evaluation, not the final destructure read: a
// host-anchored check saw the later reassignment as dominating and wrongly bailed the first case.
// contrast: reassigning BEFORE the capture DOES change the captured value, so es.object.group-by bails
let capturedMap = globalThis.Map;
const holder = {
  Map: capturedMap
};
capturedMap = {};
const {
  Map: {
    groupBy
  }
} = holder;
let changedObject = globalThis.Object;
changedObject = {};
const box = {
  Object: changedObject
};
const {
  Object: {
    groupBy: objectGroupBy
  }
} = box;
export { groupBy, objectGroupBy };