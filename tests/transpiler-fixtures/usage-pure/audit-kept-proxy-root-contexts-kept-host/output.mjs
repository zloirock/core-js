import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
class KeptHost {
  static probe = null == _globalThis.window ? void 0 : (c++, _self).Array;
  // a PLAIN claimless tail after the guarded hop rides the source short-circuit: past an
  // absent `window` it must read nothing (not throw), and the key effect must not run
  static plainTail = null == _globalThis.window ? void 0 : (c++, _self).Number;
  plainDotTail = null == _globalThis.window ? void 0 : _self.JSON;
  // a chain END that is ITSELF a proxy hop belongs to the alias / kept canons - unless the nav
  // below it short-circuits, and then nothing else owns the chain at all: the render takes it,
  // the end hop rides outside the guard on the always-defined ponyfill, and the hop stops being
  // read raw. an SE-keyed end keeps its own migration canon and stays as it was
  static endHop = null == _globalThis.window ? void 0 : _self;
  endHopSeKey = null == _globalThis.window ? void 0 : _self[c++, 'window'];
  field = (_globalThis.window ?? _globalThis)[c++, 'self']?.Array;
  static {
    let sb;
    void (null == (sb = _globalThis.window) ? void 0 : _findLastIndexMaybeArray(sb[c++, "Array"].prototype).call([1], v => v));
  }
}
export const keptHost = new KeptHost();