// A local helper proven to return a constructor serves the static read off its result beside a rest: the
// claim writes ahead, and the residual keeps the call, the sibling and the rest's copy.
let f6, c6, r6;
function mkA() { return Array; }
({ fromAsync: f6, custom: c6, ...r6 } = mkA());
