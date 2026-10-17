import "core-js/modules/es.array.find-last-index";
// ... and an AGREEING pair keeps the one type
function agreeing() {
  var a = [1, 2];
  function g() {
    return a.findLastIndex(Boolean);
  }
  {
    var a = [3, 4];
  }
  return g();
}
export const r = [agreeing()];