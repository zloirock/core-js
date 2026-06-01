// a catch-param destructure default with a nested instance-method chain (`[9].flat().at(0)`):
// relocating the default into the catch prelude must compose the inner `.flat` polyfill into the
// outer `.at` polyfill, not flat-splice the two overwrites into an overlap
try {} catch ({ [Symbol.iterator]: it = [9].flat().at(0) }) { it; }
