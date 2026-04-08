type Box<T> = { get(): T[] };
function run(b: Box<number>) {
  b.get().at(0);
}
