// The constructor is written before the following native subtree's getter runs.
let ctor = 0, value;
Object.defineProperty(globalThis, 'mixedCtorProbe', {
  configurable: true,
  value: { get x() { return typeof ctor; } }
});
({ Set: ctor, mixedCtorProbe: { x: value } } = globalThis);
export const out = [typeof ctor, value];
delete globalThis.mixedCtorProbe;
