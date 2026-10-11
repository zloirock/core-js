// a sequence prefix reading an accessor runs ahead of the extraction however the file writes that key -
// through the setter of the pair, an object's or a class's static one, through `this` elsewhere, beside a
// class static: an assignment runs the setter and never replaces the getter. a read of a key only a setter
// defines runs nothing and leaves
const observed = { get value() { log(); return 0; }, set value(v) { log(v); } };
export const { prototype: { at } } = (observed.value, String);
observed.value = 2;
class Pair { static get count() { log(); return 0; } static set count(v) { log(v); } }
export const { prototype: { findLast } } = (Pair.count, Array);
Pair.count = 1;
class Box { static get size() { log(); return 0; } }
export const { prototype: { includes } } = (Box.size, Array);
function reset() { this.size = 0; }
const quiet = { set mode(v) { log(v); } };
export const { prototype: { padEnd } } = (quiet.mode, String);
