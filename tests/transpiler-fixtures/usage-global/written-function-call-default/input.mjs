// An argument known to be undefined activates the written function's default.
const box = {};
box.fn = (value = [8, 9]) => value;
const empty = undefined;
use(box.fn(empty).at(-1));
