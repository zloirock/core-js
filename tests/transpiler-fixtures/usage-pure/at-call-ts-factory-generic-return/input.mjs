type Box<T> = { v: T[] };
function makeBox<T>(): Box<T> {
  return { v: [] };
}
function run() {
  makeBox<number>().v.at(0);
}
