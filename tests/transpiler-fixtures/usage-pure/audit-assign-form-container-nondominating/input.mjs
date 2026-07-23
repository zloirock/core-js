// an assignment-form container alias resolves in pure only when the write DOMINATES the read: the
// receiver-less pure rewrite drops the binding, so a read reached before the write executed would
// un-throw the native undefined-access. each read below sits before its container write, so the
// alias must stay native - substituting a polyfill import here would mask a runtime TypeError.
// distinct method per line.
let arrayBox;
export const early1 = arrayBox.Array.from([1]);
[arrayBox] = [globalThis];
let objectBox;
export const early2 = objectBox.Array.of(2);
({ k: objectBox } = { k: globalThis });
