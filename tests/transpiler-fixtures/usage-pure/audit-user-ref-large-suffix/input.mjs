// `_ref100` is a valid plugin-emittable shape per ORPHAN_REF_PATTERN
// (`[1-9]\d+` matches 10+). User code declaring `_ref100` reserves the
// name through scope.hasBinding (babel) / collectAllBindingNames (unplugin);
// plugin-allocated `_ref` lands on bare slot regardless of how high
// user-declared suffix climbs
let _ref100 = "user";
const arr = [1, 2, 3];
arr.at(0);
arr.findLast(x => x > 0);
console.log(_ref100);
