import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a for-of head over a container whose slot the file wrote binds the written value too: the declared
// head and the assigned one alike read the literal's value or the written one, so pure guards the
// static read on the written constructor and usage-global injects for it
const box = {
  a: Math
};
box.a = Array;
for (const {
  a: A
} of [box]) A.of(1);
const bag = {
  b: Math
};
bag.b = String;
let S = Math;
for ({
  b: S
} of [bag]) S.raw`x`;