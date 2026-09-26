// a function DECLARATION's name accounts for every caller, so a call list that leaves the slot empty
// proves the default IS the value and the read narrows to its family. a function EXPRESSION is reached
// as a VALUE - but a value has exactly ONE position, so an invocation standing there IS its whole
// external caller set and the same proof holds. what its own name adds is a caller INSIDE it: an
// empty reference set says the function never recurses, and a non-empty one is a call the census
// must read like any other, so a self-call passing a foreign argument keeps the generic dispatch
function declared(x = [1, 2]) { return x.at(0); }
const fromDeclaration = declared();
const fromNamedIife = (function named(y = [1, 2]) { return y.at(0); })();
const fromAnonymousIife = (function (z = [1, 2]) { return z.at(0); })();
const fromSelfCallingIife = (function recurses(w = [1, 2]) { return typeof w === 'string' ? w.at(0) : recurses('ab'); })();
export default [fromDeclaration, fromNamedIife, fromAnonymousIife, fromSelfCallingIife];
