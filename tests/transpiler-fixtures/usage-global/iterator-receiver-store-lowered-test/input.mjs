// A lowered optional test must read the retained environment value before its key.
export function read(effects) {
  globalThis.box = [3];
  let held, ref;
  return (ref = (effects.push('prefix'), held = globalThis.window).self) == null
    ? void 0 : ref[(effects.push('key'), 'box')].at(0);
}
