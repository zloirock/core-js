// A nested iterator read keeps the full initializer once, including sibling effects.
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";

let count = 0;
const hit = () => ++count;
const _ref = { z: (hit(), 1), w: (hit(), _globalThis) };
const method = _getIteratorMethod(_ref.w);
const { z } = _ref;

use(method, z, count);