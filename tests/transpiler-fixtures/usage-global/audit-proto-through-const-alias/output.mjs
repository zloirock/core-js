import "core-js/modules/es.array.at";
// alias-chain: const A = Array -> const P = A.prototype -> P.at injects `es.array.at`
const A = Array;
const P = A.prototype;
P.at(0);