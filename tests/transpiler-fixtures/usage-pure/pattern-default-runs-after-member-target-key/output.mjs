import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A pattern default runs only after its slot is read, but a member target is a reference the
// assignment takes first: its computed key runs ahead of the default. A read in the default sees
// the key's write, and a read in the key misses the default's.
let text = [1];
const box = {};
({
  a: box[text = 'ab', 'k'] = _at(text).call(text, 0)
} = {});
let list = 'cd';
[box[_includesMaybeString(list).call(list, 'c') ? 'x' : 'y'] = list = [1]] = [];
export const made = [box, list];