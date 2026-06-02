// core-js-disable-file
// a `core-js-disable-file` directive skips the whole file; the minifier-sequence split must not
// run on disabled source (it is gated below the skipFile determination), so the collapsed
// `(prefix, ({pat} = R))` sequence is returned without being broken into separate statements
spy(), ({ from } = Array);
from([1, 2, 3]);
