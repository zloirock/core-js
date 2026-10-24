// Pre-pass injects `_Array$from`; post-pass must still recognise it as the array constructor source.
// Receiver narrowing on the alias-stored result must survive the dedup boundary across passes.
const xs = Array.from('abc');
const e = xs.entries();
const k = xs.keys();
const s = xs.slice(0, 2);
