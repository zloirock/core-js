// Object.create returns a NEW object whose [[Prototype]] is the argument, so its instance-method
// surface is indeterminate (an array-proto result inherits `.includes`, a plain-object proto does not).
// the result is left un-hinted so it routes to the receiver-dispatching generic helper - which
// polyfills the inherited method without an Array claim. the bare Object.create is a polyfilled static.
const C = Object.create([1, 2]);
C.includes(1);
