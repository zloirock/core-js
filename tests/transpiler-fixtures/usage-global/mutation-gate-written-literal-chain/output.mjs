import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// a chain written through a slot whose written value is a fresh LITERAL lands on that literal, where
// no built-in is reachable: the mutation census opens nothing for it, and a static's known return
// type keeps narrowing the instance read below
const cfg = {};
cfg.a = {};
cfg.a.b = 1;
export const last = Array.from(src).at(-1);