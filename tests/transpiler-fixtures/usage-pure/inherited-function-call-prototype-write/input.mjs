// A prototype replacement invalidates the inherited intrinsic call proof.
Object.prototype.toString = () => [8, 9];
const box = {};
use(box.toString().at(-1));
