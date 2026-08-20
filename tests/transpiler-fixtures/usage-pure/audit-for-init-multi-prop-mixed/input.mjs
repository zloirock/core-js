// for-loop init destructuring a mix of static and instance properties from one
// receiver: each path gets its appropriate pure-mode polyfill alias.
for (const { from } = Array, { at } = [0]; false;) { from([at(0)]); }
