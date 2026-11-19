// A written toString slot can return an array; inherited-call narrowing must not apply.
const box = {};
box.toString = () => [8, 9];
use(box.toString().at(-1));
