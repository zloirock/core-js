// A computed-key entry beside a rest element in a DECLARED function's parameter destructure:
// the old body-extract of the computed-key entry was caller-lossy.
// caller-soundness: lossy emissions are allowed here because the function is non-exported and
// every local call leaves the default in place (the resolver's call-site scan proves nothing
// exists to lose); exported / escaping / overridden functions stay verbatim instead.
const k = 'of';
function run({ [k]: make, ...rest } = Array) {
  return make([1]) && rest;
}
run();
