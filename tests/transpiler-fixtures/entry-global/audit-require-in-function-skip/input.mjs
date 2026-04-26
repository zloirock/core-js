// `require('core-js/...')` inside a function body is a runtime conditional load, not
// a static entry-import.
function init() {
  require('core-js');
}
init();
