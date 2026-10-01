type Box<T> = { v: T[] };
function makeBox<T = string>(): Box<T> {
  return { v: [] };
}
function run() {
  makeBox().v.at(0);
}
