import "core-js/modules/es.string.at";
// A var key is visible after its declaring block.
function read() {
  {
    var key = 'name';
  }
  const object = {
    [key]: 'alice'
  };
  return object.name.at(-1);
}