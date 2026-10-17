import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a switch tries every case test before it falls back to `default`, the tests below the default clause
// included, so a write in such a test reaches the default body above it: the body reads what the test
// stored, and pure keeps both candidates. a write in a case BODY below runs after the default body
let C;
C = _Map;
switch (k) {
  default:
    use((C === _Map ? _Map$groupBy : C === Object ? _Object$groupBy : C.groupBy.bind(C))(xs, f));
  case (C = Object, 1):
    ;
}
let E;
E = _Promise;
switch (k) {
  default:
    use(_Promise$try(f));
  case 2:
    E = Object;
}