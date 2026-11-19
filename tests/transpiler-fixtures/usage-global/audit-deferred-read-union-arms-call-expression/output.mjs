import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A deferred reader resolves each reaching write in the write scope. Unshadowable nullish values add no receiver; an unknown value
// prevents narrowing to a known family.
let opaqueSlot = null;
const readSlot = () => opaqueSlot.at(0);
[opaqueSlot] = [source()];
export const a = readSlot();