// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
(function run({ from, ...rest } = Array) {
  var from = 7;
  return [from, rest];
})();
(function make({ of: of_, x: a } = Array) {
  function of_() {}
  return [of_, a];
})();
(function keep({ resolve, ...rest } = Promise) {
  function inner() { var resolve = 1; return resolve; }
  return [resolve, rest, inner];
})();
