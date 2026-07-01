// `_ref100` is a valid plugin-emittable shape per the orphan-ref pattern
// (multi-digit suffixes match). User code declaring `_ref100` reserves the
// name through scope.hasBinding (babel) / the binding-name scan (unplugin);
// plugin-allocated `_ref` lands on bare slot regardless of how high
// user-declared suffix climbs
let _ref100 = "user";
const arr = [1, 2, 3];
arr.at(0);
arr.findLast(x => x > 0);
console.log(_ref100);
