// member-optional method-call hop on a NON-polyfilled method (`?.foo()`): same whole-chain
// short-circuit requirement as a polyfilled hop, but the hop threads its deoptionalized verbatim
// source behind the lifted `null ==` guard instead of a binding call
arr.flat?.()?.foo().includes(0);
