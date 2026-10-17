// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
class KeptHost {
  static probe = globalThis.window?.[(c++, 'self')]?.Array;
  // a PLAIN claimless tail after the guarded hop rides the source short-circuit: past an
  // absent `window` it must read nothing (not throw), and the key effect must not run
  static plainTail = globalThis.window?.[(c++, 'self')].Number;
  plainDotTail = globalThis.window?.self.JSON;
  // a chain END that is ITSELF a proxy hop belongs to the alias / kept canons - unless the nav
  // below it short-circuits, and then nothing else owns the chain at all: the render takes it,
  // the end hop rides outside the guard on the always-defined ponyfill, and the hop stops being
  // read raw. an SE-keyed end keeps its own migration canon and stays as it was
  static endHop = globalThis.window?.self?.['window'];
  endHopSeKey = globalThis.window?.self?.[(c++, 'window')];
  field = (globalThis.window ?? globalThis)[(c++, 'self')]?.Array;
  static {
    let sb;
    void ((sb = globalThis.window)?.[(c++, 'self')].Array.prototype.findLastIndex.call([1], v => v));
  }
}
export const keptHost = new KeptHost();
