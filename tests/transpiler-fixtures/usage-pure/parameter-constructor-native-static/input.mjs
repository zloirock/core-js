// A constructor bound by a parameter remains a native receiver in the body.
function read({ Promise: P } = globalThis) { return P.resolve(1); }
read();
