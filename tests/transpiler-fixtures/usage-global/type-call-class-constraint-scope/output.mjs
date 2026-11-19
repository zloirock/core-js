import "core-js/modules/es.array.at";
// A class constraint is resolved at its declaration, before caller-local aliases.
type Mode = 'lines' | 'text';
class Box<T extends Mode> {
  constructor(value: T) {}
  get(): T extends 'lines' ? number[] : string {
    return null as any;
  }
}
export function last() {
  type Mode = {};
  return new Box('lines').get().at(-1);
}