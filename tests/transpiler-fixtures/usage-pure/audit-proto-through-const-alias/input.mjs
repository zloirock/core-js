// alias-chain: const A = Array -> const P = A.prototype -> P.at routed through Array-specific helper
const A = Array;
const P = A.prototype;
P.at(0);
