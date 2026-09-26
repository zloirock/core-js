import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
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
export const fromBox = A.of(1);
const list = [Math];
list[0] = String;
let S = Math;
[S] = list;
export const fromList = S.raw`x`;
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
export const fromDeep = O.groupBy([1], x => x);