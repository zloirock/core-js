import _Array$from from "@core-js/pure/actual/array/from";
// deeper proxy-global chain through OME: `cond ? Array : globalThis?.self.Array`. the OME
// links `globalThis?.self` AND the regular `.Array` MemberExpression mid-chain - mixed
// optional / non-optional hops. `resolveObjectName` walks the chain via `globalProxyMemberName`
// (handles both link kinds), per-branch synth-swap fires for the OME-deep branch too
declare const cond: boolean;
function f({
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
f();