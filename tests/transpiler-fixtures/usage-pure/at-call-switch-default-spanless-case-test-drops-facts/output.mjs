import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// The `default` clause narrows by excluding every explicit case value, and it is reached only once
// EVERY test has been evaluated - including the ones written below it. A test the emitter has
// rebuilt carries no span to place, so it could stand anywhere and the whole exclusion is dropped:
// `box.v` keeps both arms and takes the generic helper. Reading the literal `'a'` test alone would
// exclude the string arm on evidence the rebuilt test may contradict.
type Box = {
  kind: 'a';
  v: string;
} | {
  kind: 'b';
  v: number[];
};
function probe(box: Box, s: string) {
  var _ref;
  switch (box.kind) {
    case 'a':
      break;
    case _atMaybeString(s).call(s, 0):
      break;
    default:
      _at(_ref = box.v).call(_ref, -1);
      break;
  }
}
probe(null as any, '');