// Agreement retains symbol provenance through shared alias arms.
const k0 = Symbol.iterator;
const k1 = Symbol.iterator;
const k2 = first() ? k1 : k0;
const k3 = second() ? k2 : k1;
[3][k3]();
