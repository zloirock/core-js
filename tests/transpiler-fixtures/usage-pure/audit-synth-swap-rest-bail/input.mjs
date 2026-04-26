// synthetic argument-receiver substitution must bail in the presence of a rest
// parameter that would mis-align positions.
function run({ from, ...rest } = Array) {
  return from([1]);
}
run();
