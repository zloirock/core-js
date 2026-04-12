import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
try {} catch ({
  includes
}) {
  includes("x");
}
try {} catch ({
  at
}) {
  at(-1);
}