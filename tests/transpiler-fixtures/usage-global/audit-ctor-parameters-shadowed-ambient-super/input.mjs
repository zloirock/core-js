// The inherited signature belongs to Derived's outer Base.
declare class Base { constructor(a: number[]); }
class Derived extends Base {}
function shadowed() {
  class Base { constructor(b: string) {} }
  type P = ConstructorParameters<typeof Derived>;
  return (picked: P[0]) => picked.at(0);
}
