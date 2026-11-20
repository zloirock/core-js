// The array returned by Array.from narrows the following instance reads. A phase test
// introduces another read on xs after pre has replaced Array.from with an import.
const xs = Array.from('abc');
const e = xs.entries();
const k = xs.keys();
const s = xs.slice(0, 2);
