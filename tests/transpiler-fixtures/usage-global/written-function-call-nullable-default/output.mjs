import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// A possibly undefined argument can select a default of a different return family.
// Both array and string includes are needed; an iterator result is ruled out.
const choose = () => true;
const box = {};
box.fn = (value = [8, 9]) => value;
const arg = choose() ? undefined : 'abcd';
use(box.fn(arg).includes(9));