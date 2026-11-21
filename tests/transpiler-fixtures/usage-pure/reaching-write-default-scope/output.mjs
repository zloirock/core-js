import _Array$from from "@core-js/pure/actual/array/from";
let C = Array;
function install(value = C = {
  from() {
    return 19;
  }
}) {
  var C;
}
install();
export const value = (C === Array ? _Array$from : C.from.bind(C))([8]);