// Nested sequence effects stay in the literal slot before its native Array.from read.
{
let hopSeq; ({ w: { Array: { from: hopSeq } } } = { w: (f(), (g(), globalThis)) }); use(hopSeq);
}
