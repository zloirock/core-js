// A literal default governs its branch while supplied values keep instance dispatch.
function read([{ entries }] = [Object]) {
  return entries;
}
use(read([[1, 2]]));
