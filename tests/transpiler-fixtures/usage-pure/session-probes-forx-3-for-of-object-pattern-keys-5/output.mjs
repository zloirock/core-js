import _keys from "@core-js/pure/actual/instance/keys";
import _Object$keys from "@core-js/pure/actual/object/keys";
{
  for (const _ref2 of [{
    w: Object
  }, {
    w: Array
  }]) {
    const {
        w: _ref
      } = _ref2,
      keys = _ref === Object ? _Object$keys : _keys(_ref);
    keys;
  }
}