import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.at";
// A closed literal uses the intrinsic inherited toString, whose result is a string.
const box = {};
use(box.toString().at(-1));