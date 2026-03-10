import "core-js/modules/es.array.at";
class Container<T extends number[]> {
  process(x: T) {
    x.at(-1);
  }
}