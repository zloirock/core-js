import "core-js/modules/es.string.includes";
function convert() {
  return 'abc';
}
function read(value = convert()) {
  function convert() {
    return [1];
  }
  return value.includes('bc');
}
read();