// a leaf captured through a const-bound array wrapper anchors its reassignment check at
// the WRAPPER's declarator (the capture point), not the destructure host: a source write
// BETWEEN capture and destructure cannot change the captured value, so the static injects
let capturedMap = globalThis.Map;
const wrapper = [{ inner: capturedMap }];
capturedMap = {};
const [{ inner: { groupBy } }] = wrapper;
export { groupBy };

// negative: a write BEFORE the capture dominates the capture read - the leaf stays raw
// (no `es.iterator.from`; the ctor-set noise comes from the value read alone)
let src2 = globalThis.Iterator;
src2 = {};
const wrapper2 = [{ inner: src2 }];
const [{ inner: { from } }] = wrapper2;
export { from };

// TWO wrapper levels: the capture walk resolves ONE wrapper level - a second level stays
// raw on both emitters (bias-safe under-inject: only the constructor value-read group
// appears, no static entry). the probe is a uniquely-attributable STATIC, so a future
// depth-2 resolution would surface here as a new import
let capturedPromise = globalThis.Promise;
const w1 = [{ a: capturedPromise }];
capturedPromise = {};
const w2 = [{ b: w1[0] }];
const [{ b: { a: { withResolvers } } }] = [w2[0]];
export { withResolvers };
