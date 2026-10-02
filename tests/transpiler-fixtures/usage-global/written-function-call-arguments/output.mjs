import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// Each invocation reads its own argument through the assigned function.
// The array call uses at; the string call uses includes.
const box = {};
box.fn = value => value;
use(box.fn([8, 9]).at(-1));
use(box.fn("abcd").includes("bc"));