import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
try {} catch ({
  includes,
  at
}) {
  includes("x");
  at(-1);
}