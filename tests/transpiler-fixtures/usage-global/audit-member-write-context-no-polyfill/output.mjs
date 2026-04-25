import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// MemberExpression in pure-write contexts doesn't require the prototype-method polyfill -
// the receiver method isn't read at runtime. compound assignment / update / logical-assign
// all read LHS first, so the polyfill IS needed there. plugins must converge: babel was
// over-injecting on `=` / destructure-LHS / destructure-default, unplugin was under-
// injecting on compound
obj.at = v;
({
  a: obj.includes
} = src);
({
  x: obj.flatMap = 1
} = src);
arr.flat += 1;
arr.at ||= [];
arr.findLast++;