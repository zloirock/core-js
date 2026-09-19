import _Array$from from "@core-js/pure/actual/array/from";
// deeper proxy-global chain through an OptionalMemberExpression: `cond ? Array :
// globalThis?.self.Array`. the chain mixes an optional `globalThis?.self` hop with a regular
// `.Array` MemberExpression hop. the proxy-global resolution must walk both link kinds, so
// per-branch synth-swap still fires for the OME-deep branch.
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