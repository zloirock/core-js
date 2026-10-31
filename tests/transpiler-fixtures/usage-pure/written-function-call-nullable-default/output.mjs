import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A possibly undefined argument can select a default of a different return family.
// Both array and string includes are needed; an iterator result is ruled out.
const choose = () => true;
const box = {};
box.fn = (value = [8, 9]) => value;
const arg = choose() ? undefined : 'abcd';
use(_includes(_ref = box.fn(arg)).call(_ref, 9));