// an INDIRECT eval - the callee reached through anything but a bare `eval` reference - evaluates in
// the GLOBAL scope and reaches no local binding, so it is not an opaque write and the narrow
// stands. the sequence prefix is the whole difference from the direct spelling next door, which is
// why the callee peel here must not elide it
let sequenced = [1, 2];
(0, eval)("sequenced = 'ab'");
sequenced.at(0);
