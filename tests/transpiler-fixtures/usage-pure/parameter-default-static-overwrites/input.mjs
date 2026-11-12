// Effectful keys keep the native pattern; both statics are served in the body.
function read([{ of, from, [(effect(), "key")]: other } = Array]) {
  return [of(4), from([9]), other];
}
read([void 0]);
