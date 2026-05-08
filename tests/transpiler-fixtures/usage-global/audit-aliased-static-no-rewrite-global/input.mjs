// usage-global mode keeps `Array.from` unrewritten, but receiver narrowing through the
// destructure (`const { from } = Array`) still has to fire so subsequent instance calls
// emit array-specific side-effect imports rather than generic instance ones
const { from } = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(x => x);
arr.flat();
