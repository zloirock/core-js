class Cls {
  get creator() { return () => ['a', 'b', 'c']; }
}
new Cls().creator().at(0).fixed(2);
