// parameter destructure whose default is a `self.Array` member (proxy-global root other than
// globalThis) with one polyfilled key (`of`) and one unpolyfilled key (`extra`). the synth swap
// owns the receiver chain, so the unpolyfilled key's member-access fallback must substitute the
// `self` proxy root to its polyfill - otherwise a bare `self` leaks and ReferenceErrors where
// `self` is undefined
function f({ of, extra } = self.Array) { return [of, extra]; }
f();
