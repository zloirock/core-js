// A getter in a parameter element calls an earlier closure before at is initialized.
// Pure receiver capture must preserve that TDZ throw and the original getter count.
export function read(probe = () => at, [{
  at
}] = [{
  get at() {
    return probe();
  }
}]) {
  return at;
}