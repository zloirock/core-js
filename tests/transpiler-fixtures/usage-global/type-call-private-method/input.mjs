// Private methods cannot be overridden, so their concrete body remains authoritative.
class Base {
  #value(): string | number[] { return 'ab'; }
  last() { return this.#value().at(-1); }
}
export { Base };
