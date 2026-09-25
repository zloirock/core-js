import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// A computed receiver is evaluated once for its nested instance bindings and surviving siblings.
// An array wrapper captures its element before the nested read. A sequence-prefixed receiver
// carries its prefix into the one read the claim performs; extra receiver evaluations must not be
// introduced.
const _ref = mk().data;
const withLeafSibling = _at(_ref);
const leafSibling = _keys(_ref);
const _ref2 = mk();
const {
  other: plainSibling
} = _ref2;
const withHostSibling = _at(_ref2.data);
const behindPrefix = _at((eff(), mk()).data);
const [_ref3] = [mk()];
const inWrapper = _at(_ref3.data);
export { withLeafSibling, leafSibling, withHostSibling, plainSibling, behindPrefix, inWrapper };