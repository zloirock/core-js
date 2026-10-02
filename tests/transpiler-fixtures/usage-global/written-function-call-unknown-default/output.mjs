import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A default does not close an unknown argument set.
// The call result stays generic because the supplied value may be any family.
const box = {};
box.fn = (value = [8, 9]) => value;
use(box.fn(foreign).includes(9));