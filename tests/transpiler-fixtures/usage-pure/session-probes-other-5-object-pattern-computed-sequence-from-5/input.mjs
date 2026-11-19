// An effectful outer key beside a sibling retains its native nested from read.
function eff() { return Object; }
{
const { [(eff('k'), 'w')]: { from: f4b }, z } = { w: Array, z: 1 };
}
