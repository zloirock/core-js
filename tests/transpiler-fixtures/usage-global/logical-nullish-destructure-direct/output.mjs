import "core-js/modules/es.array.of";
// A logical assignment supplies a constructor directly or through a realm hop.
// Global injection includes Array.of; pure keeps the assignment and native residual.
let a = null;
const {
  of
} = a ??= Array;
of(7);