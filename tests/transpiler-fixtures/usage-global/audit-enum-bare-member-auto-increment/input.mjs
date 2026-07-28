// An initialiser-less enum member is auto-numbered from the one before it, so its kind follows the
// nearest preceding initialised member rather than defaulting to number. After a non-numeric member
// the emitters do not even agree on what it holds, so it stays opaque. Methods differ per row because
// usage-global only observes the file-wide import set: `at` (array + string) reads the opaque
// member, `includes` (array + string + iterator) the numeric one, `find` (array + iterators) the
// bigint-successor - so each row's verdict stays attributable.
enum Labelled { Name = "core", Next }
enum Counted { First = 1, Second }
enum Huge { Big = 1n, Bigger }
const opaque: Labelled = Labelled.Next;
const numeric: Counted = Counted.Second;
const afterBigInt: Huge = Huge.Bigger;
opaque.at(0);
numeric.includes(1);
afterBigInt.find(x => x);
