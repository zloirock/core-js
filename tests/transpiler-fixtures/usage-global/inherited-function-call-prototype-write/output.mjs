import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A prototype replacement invalidates the inherited intrinsic call proof.
Object.prototype.toString = () => [8, 9];
const box = {};
use(box.toString().at(-1));