import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A written toString slot can return an array; inherited-call narrowing must not apply.
const box = {};
box.toString = () => [8, 9];
use(box.toString().at(-1));