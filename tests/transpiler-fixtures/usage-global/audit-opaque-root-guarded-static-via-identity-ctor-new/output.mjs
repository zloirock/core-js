import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a CTOR read through the guarded identity chain: the guard tests the window prefix, both
// legs construct the ponyfill (`new _Map`) - the arrow-paren reprint differs cosmetically
export const viaIdentityCtorNew = (x => x)(globalThis)?.window?.Map && new ((x => x)(globalThis).Map)([[1, 2]]).size;