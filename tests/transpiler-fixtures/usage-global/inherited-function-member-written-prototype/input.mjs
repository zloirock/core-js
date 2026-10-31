// A file-visible Object.prototype write invalidates the inherited Function proof.
// The nested receiver must keep dispatch for the installed array value.
Object.prototype.toString = [1, 2];
use(({}).toString.at(-1));
