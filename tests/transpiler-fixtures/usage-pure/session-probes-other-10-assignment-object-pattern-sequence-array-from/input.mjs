// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
{
let hopSeq; ({ w: { Array: { from: hopSeq } } } = { w: (f(), (g(), globalThis)) }); use(hopSeq);
}
