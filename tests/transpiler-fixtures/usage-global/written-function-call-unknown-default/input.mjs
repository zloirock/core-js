// A default does not close an unknown argument set.
// The call result stays generic because the supplied value may be any family.
const box = {};
box.fn = (value = [8, 9]) => value;
use(box.fn(foreign).includes(9));
