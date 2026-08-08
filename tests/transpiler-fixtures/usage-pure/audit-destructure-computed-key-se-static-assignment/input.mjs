// a STATIC SE-key in an assignment: it must NOT take a receiver overwrite (statics have none) - the
// instance overwrite path is gated on kind; a static keeps the SE key in place and binds the pure import
let f;
({ [(eff(), 'from')]: f } = Array);
