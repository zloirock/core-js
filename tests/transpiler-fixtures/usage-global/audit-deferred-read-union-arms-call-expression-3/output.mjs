import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
let voidWrite = [1];
const readVoid = () => voidWrite.flatMap(f);
voidWrite = void 0;
export const c = readVoid();