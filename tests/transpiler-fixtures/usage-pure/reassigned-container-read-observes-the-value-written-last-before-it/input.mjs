// a reassigned container's read observes the value written last before it: a write after the read leaves
// the init, an identity self-assign is no write, a cross-write captures what it reads at its own assignment,
// an identity write beside a real one leaves the real one dominating, and an inner shadow's write never
// reaches the outer binding - pure resolves each read to that one value
let rw4 = { a: Object };
const { keys: beforeWrite } = rw4.a;
rw4 = { a: Map };
let rw8 = { m: Object };
rw8 = rw8;
const { m: { values: viaSelfAssign } } = rw8;
let ma = { x: Object };
let mb = { x: String };
ma = mb;
mb = ma;
const { x: { raw: viaCrossWrite } } = ma;
let wIR = { k: Object };
wIR = wIR;
wIR = { k: Reflect };
const { k: { ownKeys: viaIdentityThenReal } } = wIR;
let wSh = { y: Symbol };
{
  let wSh = null;
  void wSh;
}
const { y: { asyncIterator: viaShadowClean } } = wSh;
export { beforeWrite, viaSelfAssign, viaCrossWrite, viaIdentityThenReal, viaShadowClean };
