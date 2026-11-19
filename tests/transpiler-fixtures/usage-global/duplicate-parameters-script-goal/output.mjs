require("core-js/modules/es.array.at");
// A simple duplicate parameter list is legal in sloppy code and keeps that loading mode.
function pick(a, a) {
  return [a].at(0);
}
var result = pick(1, 3);