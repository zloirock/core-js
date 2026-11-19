// A static claim inside a realm key remains live when a for initializer keeps its source receiver.
let a;
let out3;
for (const { iterator } = globalThis[(a = Array.of(2), 'self')].Symbol; !out3;) {
  out3 = typeof iterator;
}
export const r3 = [out3, a.length];
