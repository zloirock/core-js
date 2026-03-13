import "core-js/modules/es.string.includes";
function foo(obj) {
  for (const key in obj) {
    key.includes('prefix');
  }
}