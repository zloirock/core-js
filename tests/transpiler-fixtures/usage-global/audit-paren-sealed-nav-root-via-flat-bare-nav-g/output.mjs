import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-exception.constructor";
import "core-js/modules/web.dom-exception.stack";
import "core-js/modules/web.dom-exception.to-string-tag";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
import "core-js/modules/web.structured-clone";
// full-consume / call-rooted probe shapes: the global flavor keeps the source verbatim and
// must still DETECT through them (injection sets are the lock)
export const {
  structuredClone: viaFlatBareNavG
} = globalThis.window?.self;