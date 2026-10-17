// non-method member reads stay plain reads - element precision survives
const measured = [[1], [2]];
use(measured.length, measured.custom);