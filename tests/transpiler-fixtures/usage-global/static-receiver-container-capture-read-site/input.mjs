// usage-global static-receiver walk read-site through a container. a value captured into an object literal
// (or class static) is fixed when the container is EVALUATED, so a reassignment of the source binding AFTER
// that capture cannot change it - the walk keeps resolving `holder.Map` to Map and injects es.map.group-by.
// the reassignment check must anchor on the CONTAINER's evaluation, not the final destructure read: a
// host-anchored check saw the later reassignment as dominating and wrongly bailed the first case.
// contrast: reassigning BEFORE the capture DOES change the captured value, so es.object.group-by bails
let capturedMap = globalThis.Map;
const holder = { Map: capturedMap };
capturedMap = {};
const { Map: { groupBy } } = holder;

let changedObject = globalThis.Object;
changedObject = {};
const box = { Object: changedObject };
const { Object: { groupBy: objectGroupBy } } = box;

export { groupBy, objectGroupBy };
