// chain-assign receiver of a proxy-global static, multi-trailing (combined-chain path): the static
// must collapse to its pure ctor AND the assignment side effect must survive, as a sequence
// `(a = _globalThis, _Map)` - dropping the assignment loses `a`, keeping `.Map` reads the absent
// native Map on engines without it. mirrors the natural visitor / single-trailing emit
let a;
const r = (a = globalThis).Map.notAMethod?.().flat().at(0);
