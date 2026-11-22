type Box<T> = { v: T[] };
function makeBox<T = string>(): Box<T> {
  return { v: [] };
}
function run() {
  makeBox().v.at(0);
}

// The scalar slot exposes the default and an explicit override independently.
declare function makeValue<T = string>(): { v: T };
makeValue().v.at(0);
makeValue<number[]>().v.at(0);
