// Chain-assignment receiver `(a = X).method(...)` must keep the assignment as an observable side effect
// even when dispatch drops or gates the receiver. three shapes: static-drop (`(a = Array).from` keeps
// `a = Array` then swaps to the import), gated-instance (`(b = Map).keys` - keys is gated off the Map
// constructor, yet the `b = Map` assignment survives via the sequence), and plain-literal instance-memoize.
const r = (a = Array).from([1]);
const s = (b = Map).keys();
const t = [1, 2, 3].includes(2);
[r, s, t];
