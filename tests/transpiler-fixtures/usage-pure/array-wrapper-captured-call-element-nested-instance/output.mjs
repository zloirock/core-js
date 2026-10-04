import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A computed wrapper element is captured before its nested instance read.
// Each element evaluates once and sibling effects retain their source order.
// A proven realm result uses the Array dispatcher, reading the captured element.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const realm = () => _globalThis;
const [_ref] = [realm()];
const soleAt = _atMaybeArray(_ref.Array.prototype);
let out;
for (const [_ref2, _ref3] = [realm(), eff('t')], headAt = _atMaybeArray(_ref2.Array.prototype), tail = _ref3; !out;) out = [headAt, tail];
export { soleAt, out, seen };