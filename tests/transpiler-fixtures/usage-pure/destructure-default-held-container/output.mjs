import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _String$raw from "@core-js/pure/actual/string/raw";
// a default over a literal reached through a NAME is no certain default: the file may have written
// the slot through that name since - an index of an empty array, a key of an empty object, a slot of
// the literal an aliased call yields - so pure guards each read on the default instead of taking it,
// and usage-global injects for the default beside the written value
const list = [];
list[0] = FakeArray;
const [A = Array] = list;
export const fromList = (A === Array ? _Array$of : A.of.bind(A))(1);
const bag = {};
bag.k = FakeObject;
const {
  k: O = Object
} = bag;
export const fromBag = (O === Object ? _Object$fromEntries : O.fromEntries.bind(O))([]);
const make = () => ({});
const made = make();
made.s = FakeString;
const {
  s: S = String
} = made;
export const fromMade = (S === String ? _String$raw : S.raw.bind(S))`x`;