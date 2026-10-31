// a catch-param destructure default with an IIFE whose arrow body hosts an instance-method
// polyfill (`[1].at(0)`): the arrow body-wrap and the `.at` overwrite cover the same range and
// must compose, not collide, when the default is relocated into the catch prelude
try {} catch ({ [Symbol.iterator]: it = (() => [1].at(0))() }) { it; }
