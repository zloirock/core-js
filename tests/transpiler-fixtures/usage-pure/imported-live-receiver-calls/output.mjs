import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A source import is a live binding: its exporter can replace the receiver during
// the method getter. Plain and optional calls must retain the originally selected
// receiver for dispatch and this; usage-global only injects the instance modules.
import { receiver } from './receiver.mjs';
var _ref, _ref2;
_at(_ref = receiver).call(_ref, 0);
null == (_ref2 = receiver) ? void 0 : _flatMaybeArray(_ref2)?.call(_ref2);