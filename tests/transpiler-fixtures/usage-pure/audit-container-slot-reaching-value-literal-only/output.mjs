import _keys from "@core-js/pure/actual/instance/keys";
import _Object$keys from "@core-js/pure/actual/object/keys";
// an arithmetic compound is still a write - the bail does not care about the value
const cc = {
  c: Object
};
cc.c += 1;
const {
    c: _ref
  } = cc,
  literalOnly = _ref === Object ? _Object$keys : _keys(_ref);
export { literalOnly };