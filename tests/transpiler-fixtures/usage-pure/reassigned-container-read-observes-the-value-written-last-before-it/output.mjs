import _Map from "@core-js/pure/actual/map/constructor";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Reflect from "@core-js/pure/actual/reflect";
import _Symbol from "@core-js/pure/actual/symbol";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let rw4 = {
  a: Object
};
const beforeWrite = _Object$keys;
rw4 = {
  a: _Map
};
let rw8 = {
  m: Object
};
rw8 = rw8;
const {
  m: {
    values: viaSelfAssign
  }
} = rw8;
let ma = {
  x: Object
};
let mb = {
  x: String
};
ma = mb;
mb = ma;
const {
  x: {
    raw: viaCrossWrite
  }
} = ma;
let wIR = {
  k: Object
};
wIR = wIR;
wIR = {
  k: _Reflect
};
const {
  k: {
    ownKeys: viaIdentityThenReal
  }
} = wIR;
let wSh = {
  y: _Symbol
};
{
  let wSh = null;
  void wSh;
}
const {
  y: {
    asyncIterator: viaShadowClean
  }
} = wSh;
export { beforeWrite, viaSelfAssign, viaCrossWrite, viaIdentityThenReal, viaShadowClean };