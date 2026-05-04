// Direct destructure of `Array` - babel rewrites the destructure in place leaving a
// polyfill-binding entry for `from` (`array/from`). The unrewriten unplugin path
// resolves the same pair through the destructure binding shape. Subsequent calls of
// the alias must narrow their result to Array, and each downstream instance method
// locks the staticPairFrom* extractor.
const { from, of } = Array;
const result1 = from('abc');
const result2 = of(1, 2);
result1.findLast(x => x);
result2.flat();
