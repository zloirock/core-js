import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// the computed root is admitted only where the extraction is its SOLE reader. leaf siblings ride the
// same single read through the flat twin's memo; a HOST sibling keeps its own read of the root, which
// only a MEMO affords - the whole init binds one ref both readers take, the claim leaves with the
// levels it empties; a sequence prefix and an array wrapper keep the pattern native, the standing
// boundary. the sidecar is the two legs' declarator grouping around that minted ref - one declaration
// against a statement each, the ref-hoist placement class
const _ref = mk().data;
const withLeafSibling = _at(_ref);
const leafSibling = _keys(_ref);
const _ref2 = mk();
const withHostSibling = _at(_ref2.data);
const {
  other: plainSibling
} = _ref2;
const {
  data: {
    at: behindPrefix
  }
} = (eff(), mk());
const [{
  data: {
    at: inWrapper
  }
}] = [mk()];
export { withLeafSibling, leafSibling, withHostSibling, plainSibling, behindPrefix, inWrapper };