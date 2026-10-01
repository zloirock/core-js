import "core-js/modules/es.object.entries";
// Two nested numeric keys descend to the constructor held in the inner array element.
const twoLevelContainer = function () {
  const {
    0: {
      0: {
        entries
      }
    }
  } = [[Object]];
  return entries;
}();
export { twoLevelContainer };