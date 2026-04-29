// synthetic argument-receiver substitution can't shape-rebuild when a RestElement is
// present (rest exclusion would change). body-extract fallback inserts `let from =
// _polyfill;` at function body top (let, not const - parameter was reassignable, so
// `from = newValue` downstream must keep working) + replaces the polyfilled prop with
// `_unused` sentinel so rest still excludes the key. preserves "polyfill always wins"
// at the cost of caller-passed `{from: customFrom}` being ignored
function run({ from, ...rest } = Array) {
  return from([1]);
}
run();
