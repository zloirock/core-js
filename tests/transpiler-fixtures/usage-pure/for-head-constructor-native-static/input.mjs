// A pattern assignment in a loop head keeps the constructor used by its body.
let P;
for ({ Promise: P } of [globalThis]) P.allSettled([]);
