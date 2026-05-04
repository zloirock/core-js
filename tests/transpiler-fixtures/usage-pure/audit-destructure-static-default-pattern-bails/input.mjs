// AssignmentPattern in static destructure: `const { from = () => [] } = Array`. `Array`
// is non-nullable - default never fires - and `staticPairFromDestructure` peels
// AssignmentPattern.left so the binding shape resolves to (Array, from). receiver
// narrowing fires through the body-extract alias map even after babel rewrites the
// destructure to `const from = _Array$from === void 0 ? () => [] : _Array$from;`.
// distinct methods per line - `at` (multi-receiver, registry has generic variant),
// `findLast` / `copyWithin` (Array-only). all three narrow to array entries
const { from = () => [] } = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(p => p);
arr.copyWithin(0, 1);
