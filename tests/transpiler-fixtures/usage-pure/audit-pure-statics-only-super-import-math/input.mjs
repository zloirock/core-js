// math head reuses the same pass-2 statics-only registration path as Object/Array. two
// distinct numeric polyfills (`cbrt`, `hypot`) verify each super-call routes to its own
// import without cross-talk
import MyMath from '@core-js/pure/actual/math';
class Geom extends MyMath {
  static cubeRoot(n) {
    return super.cbrt(n);
  }
  static dist(...legs) {
    return super.hypot(...legs);
  }
}
