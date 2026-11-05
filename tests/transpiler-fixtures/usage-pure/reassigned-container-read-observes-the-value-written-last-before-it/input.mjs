// Each container read observes the last preceding write, including self and cross assignments.
// Native nested reads keep full constructor surfaces; direct static reads retain independent claims.
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
