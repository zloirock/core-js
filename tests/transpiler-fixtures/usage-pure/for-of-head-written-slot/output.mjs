import _Array$of from "@core-js/pure/actual/array/of";
import _String$raw from "@core-js/pure/actual/string/raw";
// a for-of head over a container whose slot the file wrote binds the written value too: the declared
// head and the assigned one alike read the literal's value or the written one, so pure guards the
// static read on the written constructor and usage-global injects for it
const box = {
  a: Math
};
box.a = Array;
for (const {
  a: A
} of [box]) (A === Array ? _Array$of : A.of.bind(A))(1);
const bag = {
  b: Math
};
bag.b = String;
let S = Math;
for ({
  b: S
} of [bag]) (S === String ? _String$raw : S.raw.bind(S))`x`;