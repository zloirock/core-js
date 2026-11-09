import _Promise from "@core-js/pure/actual/promise";
// The caller's constructor needs its namespace for the parameter's native body read.
(({
  Promise
}) => Promise.resolve(1))({
  Promise: _Promise
});