// `const { from, ...Map } = Array` - rest binding named `Map` collects remaining
// own-props of `Array`, not the global `Map`. So `Map.prototype.get` stays
// local-bound and is not polyfilled.
const { from, ...Map } = Array;
Map.prototype.get;
