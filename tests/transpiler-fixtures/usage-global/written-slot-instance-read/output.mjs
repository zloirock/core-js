import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// an instance method read off a slot the file wrote serves the written value: the literal's value is
// no certain receiver, so usage-global injects the instance polyfill and pure dispatches it - a
// declared pattern, a nested one and a pattern write alike
const box = {
  a: Math
};
box.a = [1, 2];
const {
  a: list
} = box;
export const last = list.at(-1);
const deep = {
  k: {
    m: Math
  }
};
deep.k.m = [[1], [2]];
const {
  k: {
    m: nested
  }
} = deep;
export const flat = nested.flat();
const chars = {
  c: Math
};
chars.c = 'ab';
let text = Math;
({
  c: text
} = chars);
export const has = text.includes('b');