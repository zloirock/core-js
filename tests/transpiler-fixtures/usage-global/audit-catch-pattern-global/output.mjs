import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// under usage-global a destructured `catch ({ at })` is not rewritten, but the `at`
// reference still triggers the instance-method polyfill.
try {} catch ({
  at
}) {
  at(0);
}