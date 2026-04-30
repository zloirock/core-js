import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
// math head reuses the same pass-2 statics-only registration path as Object/Array. two
// distinct numeric polyfills (`cbrt`, `hypot`) verify each super-call routes to its own
// import without cross-talk
import MyMath from '@core-js/pure/actual/math';
class Geom extends MyMath {
  static cubeRoot(n) {
    return _Math$cbrt.call(this, n);
  }
  static dist(...legs) {
    return _Math$hypot.call(this, ...legs);
  }
}