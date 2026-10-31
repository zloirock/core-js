import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A default does not close an unknown argument set.
// The call result stays generic because the supplied value may be any family.
const box = {};
box.fn = (value = [8, 9]) => value;
use(_includes(_ref = box.fn(foreign)).call(_ref, 9));