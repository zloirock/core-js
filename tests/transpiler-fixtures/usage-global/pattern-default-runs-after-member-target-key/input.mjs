// A pattern default runs only after its slot is read, but a member target is a reference the
// assignment takes first: its computed key runs ahead of the default. A read in the default sees
// the key's write, and a read in the key misses the default's.
let text = [1];
const box = {};
({ a: box[(text = 'ab', 'k')] = text.at(0) } = {});
let list = 'cd';
[box[list.includes('c') ? 'x' : 'y'] = (list = [1])] = [];
export const made = [box, list];
