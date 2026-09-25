import _Array$of from "@core-js/pure/actual/array/of";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _String$raw from "@core-js/pure/actual/string/raw";
// a pattern WRITE reads a container slot the way a declarator does: a slot the file wrote holds the
// literal's value or the written one, so pure guards the read on both and usage-global injects for
// both - an object key, an array index and a nested key alike
const box = {
  a: Math
};
box.a = Array;
let A = Math;
({
  a: A
} = box);
export const fromBox = (A === Array ? _Array$of : A.of.bind(A))(1);
const list = [Math];
list[0] = String;
let S = Math;
[S] = list;
export const fromList = (S === String ? _String$raw : S.raw.bind(S))`x`;
const deep = {
  k: {
    m: Math
  }
};
deep.k.m = Object;
let O = Math;
({
  k: {
    m: O
  }
} = deep);
export const fromDeep = (O === Object ? _Object$groupBy : O.groupBy.bind(O))([1], x => x);