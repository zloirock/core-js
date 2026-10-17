import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
{
  // A later computed key can replace w. Substitute Map only when the final w still holds the realm object.
  function k(key) {
    const {
        w: _ref
      } = {
        w: _globalThis,
        [key]: other
      },
      kd = _ref === _globalThis ? _Map : _ref.Map;
    return kd;
  }
}