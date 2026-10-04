import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// The optional member guards the whole sequence value. Its prefix stays inside
// that memo, and the argument's independent method claim is served on the first pass.
const nr = () => globalThis;
export const r = (nr().window?.self.probeGen.arr, nr().window?.self.probeGen.arr)?.flat().concat((nr().window?.self.probeGen.arr, nr().window?.self.probeGen.arr)?.flat() ?? []);
use(r);