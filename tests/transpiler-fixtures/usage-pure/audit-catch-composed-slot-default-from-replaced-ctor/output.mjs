import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref;
// ... and a receiver whose CONSTRUCTOR this pass already substituted needs no hop dispatch at all:
// the ponyfill carries the method on its own prototype, which is why the flat twin of the same read
// is native. an instance method pure adds to a NATIVE prototype is the other case, and it dispatches
const mapRecv = new _Map();
const fromReplacedCtor = _at((_ref = mapRecv.keys) === void 0 ? [] : _ref);
export { fromReplacedCtor };