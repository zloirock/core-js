// `Reflect.ownKeys` + computed property `[s]` in an object literal. the static call
// polyfills via an imported binding; a sibling transform lowers the computed key and
// allocates its own temp. both must get distinct names so the temp doesn't shadow the
// import and turn the call into `undefined is not a function`
Reflect.ownKeys({ a: 1, [s]: 2 });
