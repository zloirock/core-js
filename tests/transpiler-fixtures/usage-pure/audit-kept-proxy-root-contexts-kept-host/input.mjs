// Class fields and static blocks retain source guards and effects.
// Quiet realm tails keep their fold; effectful realm keys keep their native access.
let c = 0;
class KeptHost {
  static probe = globalThis.window?.[(c++, 'self')]?.Array;
  static plainTail = globalThis.window?.[(c++, 'self')].Number;
  plainDotTail = globalThis.window?.self.JSON;
  static endHop = globalThis.window?.self?.['window'];
  endHopSeKey = globalThis.window?.self?.[(c++, 'window')];
  field = (globalThis.window ?? globalThis)[(c++, 'self')]?.Array;
  static {
    let sb;
    void ((sb = globalThis.window)?.[(c++, 'self')].Array.prototype.findLastIndex.call([1], v => v));
  }
}
export const keptHost = new KeptHost();
