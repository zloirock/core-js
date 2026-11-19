// Agreeing key arms share analysis, not runtime evaluation of their tests.
const k0 = 'from';
const k1 = 'from';
const k2 = first() ? k1 : k0;
const k3 = second() ? k2 : k1;
Array[k3]([3]);
