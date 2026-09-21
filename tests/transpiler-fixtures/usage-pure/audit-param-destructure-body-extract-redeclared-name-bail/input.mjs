// Exported callers keep their supplied properties, including names redeclared in the body.
// No body extraction may introduce a conflicting let. Promise rest uses its index default.
function run({ from, ...rest } = Array) {
  var from = 7;
  return [from, rest];
}
function make({ of: of_, x: a } = Array) {
  function of_() {}
  return [of_, a];
}
function keep({ resolve, ...rest } = Promise) {
  function inner() { var resolve = 1; return resolve; }
  return [resolve, rest, inner];
}
export { run, make, keep };
