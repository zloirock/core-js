// Every bare-identifier WRITE form of an unbound global name replaces the global slot like `globalThis.X = ...` - each records the
// slot mutation and DEOPTS the name: reads, writes and probes stay verbatim on the live binding (pure substitutes only what it is
// CERTAIN about; the runtime then serves exactly what the user's writes left).
Promise++;
use(Promise.resolve(1));