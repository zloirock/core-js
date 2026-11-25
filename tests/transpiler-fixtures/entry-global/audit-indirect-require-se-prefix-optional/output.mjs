// The prefix runs once before the optional calls, even when the loader is nullish.
function logRequire() {
  return 'logged';
}
logRequire();
require?.("core-js/modules/es.object.to-string");
require?.("core-js/modules/es.array.from");
require?.("core-js/modules/es.string.iterator");