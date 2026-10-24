// Quiet TS-wrapped mutation receivers keep their write target on the backed realm.
// An effectful realm key keeps the native receiver and its key effect.
let e = 0;
(globalThis.window.Set as any) = function () {};
(globalThis.self.Map as any) = function () {};
(globalThis[(e++, 'window')].WeakSet as any) = function () {};
