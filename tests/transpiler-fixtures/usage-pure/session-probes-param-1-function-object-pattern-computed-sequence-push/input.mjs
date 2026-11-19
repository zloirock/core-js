{
// The receiver is evaluated once; key conversion precedes the method binding and the sibling read.
const order = []; function eff(t) { order.push(t); return t; } const { [(eff('k'), 'at')]: a, z } = [1, 2];
}
