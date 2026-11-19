// The base is captured at the extends clause, before the later alias write.
export function make() {
  { var Base = Array; }
  class List extends Base {
    static read() { return super.from([1]); }
    static other() { return this.of(2); }
  }
  Base = String;
  return List;
}
