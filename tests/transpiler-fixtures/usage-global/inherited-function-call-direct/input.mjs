// A closed literal uses the intrinsic inherited toString, whose result is a string.
const box = {};
use(box.toString().at(-1));
