import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// A computed receiver is evaluated once for its nested instance bindings and surviving siblings.
// An array wrapper captures its element before the nested read. A sequence-prefixed receiver
// remains a separate native boundary; extra receiver evaluations must not be introduced.
const _ref = mk().data;
const withLeafSibling = _at(_ref);
const leafSibling = _keys(_ref);
const _ref2 = mk();
const {
  other: plainSibling
} = _ref2;
const withHostSibling = _at(_ref2.data);
const {
  data: {
    at: behindPrefix
  }
} = (eff(), mk());
const [_ref3] = [mk()];
const inWrapper = _at(_ref3.data);
export { withLeafSibling, leafSibling, withHostSibling, plainSibling, behindPrefix, inWrapper };