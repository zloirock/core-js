// WRITE-HOST: the write gate suppresses SUBSTITUTION, not injection, and the two compound forms
// separate them. a plain write is not a read at all. `+=` and `++` DO read the member, so the
// global side injects for them, while the pure side must still leave them alone - substituting a
// call expression there would produce an invalid assignment target
const xs = [1];

xs.at = 1;

xs.at += 1;

xs.at++;

export const a = xs;
