import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
try {} catch ({
  includes,
  message: msg
}) {
  includes("x");
  console.log(msg);
}