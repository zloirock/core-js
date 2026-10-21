import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Class fields and static blocks retain source guards and effects.
// Quiet realm tails keep their fold; effectful realm keys keep their native access.
let c = 0;
class KeptHost {
  static probe = _globalThis.window?.[c++, 'self']?.Array;
  static plainTail = _globalThis.window?.[c++, 'self'].Number;
  plainDotTail = null == _globalThis.window ? void 0 : _self.JSON;
  static endHop = null == _globalThis.window ? void 0 : _self;
  endHopSeKey = null == _globalThis.window ? void 0 : _self[c++, 'window'];
  field = (_globalThis.window ?? _globalThis)[c++, 'self']?.Array;
  static {
    let sb;
    void (null == (sb = _globalThis.window) ? void 0 : _findLastIndexMaybeArray(sb[c++, 'self'].Array.prototype).call([1], v => v));
  }
}
export const keptHost = new KeptHost();