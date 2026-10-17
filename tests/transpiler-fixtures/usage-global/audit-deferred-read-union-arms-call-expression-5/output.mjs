import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.keys";
import "core-js/modules/web.dom-collections.keys";
let callResult = null;
const readCall = () => callResult.keys();
callResult = source();
export const e = readCall();