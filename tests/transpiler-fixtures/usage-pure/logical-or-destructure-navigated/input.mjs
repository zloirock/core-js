// A logical assignment supplies a constructor directly or through a realm hop.
// Global injection includes Array.of; pure keeps the assignment and native residual.
let a = null;
const { of } = (a ||= globalThis).Array;
of(7);
