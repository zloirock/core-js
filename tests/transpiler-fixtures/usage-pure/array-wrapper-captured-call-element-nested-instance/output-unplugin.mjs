// A sole array-wrapped element the source computes is captured into a binding, and the nested
// instance leaf reads through it. Where the element resolves to the global object, both legs narrow
// the dispatcher to the Array variant: the shared surface resolver names the root the value canon
// proves (a call yielding the global object) the way the member spelling's chain typing does. The
// babel leg additionally re-anchors the captured receiver on the global (`_globalThis.Array
// .prototype`) where the unplugin leg keeps the captured ref - the same import set, two spellings.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";

const seen = [];
const eff = (t) => (_pushMaybeArray(seen).call(seen, t), t);
const realm = () => _globalThis;
const [_ref] = [realm()];
const soleAt = _atMaybeArray(_ref.Array.prototype);
let out;

for (const [_ref2, _ref3] = [realm(), eff('t')],
	headAt = _atMaybeArray(_ref2.Array.prototype),
	tail = _ref3; !out; ) out = [headAt, tail];

export { soleAt, out, seen };