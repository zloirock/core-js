// proxy-global nested flatten with a residual sibling whose default holds a STATIC-method
// call. the flatten extracts `from = _Array$from`; the residual `names` default
// `Object.getOwnPropertyNames({})` must still resolve to `_Object$getOwnPropertyNames`
// in place (a static call has no receiver memo, unlike the instance-call shape)
var { Array: { from }, names = Object.getOwnPropertyNames({}) } = globalThis;
from([4]);
names;
