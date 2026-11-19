// destructuring from a property access (not a call) with one instance-method key (`at`)
// plus a remaining unknown property: the receiver must be evaluated once and shared
// between the instance polyfill and the remaining destructure.
const { at, nope } = obj.prop;
