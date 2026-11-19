// a switch tries every case test before it falls back to `default`, the tests below the default clause
// included, so a write in such a test reaches the default body above it: the body reads what the test
// stored beside the value before the switch, loading both statics. a write in a case BODY below runs
// after the default body, so the static it would name stays out
let C;
C = Map;
switch (k) {
  default: use(C.groupBy(xs, f));
  case (C = Object, 1): ;
}
let E;
E = Array;
switch (k) {
  default: use(E.from(f));
  case 2: E = Iterator;
}
