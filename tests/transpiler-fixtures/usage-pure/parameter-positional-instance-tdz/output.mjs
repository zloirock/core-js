export function read(probe = () => at, [{
  at
}] = [{
  get at() {
    return probe();
  }
}]) {
  return at;
}