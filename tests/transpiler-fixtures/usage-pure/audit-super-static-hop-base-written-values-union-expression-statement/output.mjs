import _Promise from "@core-js/pure/actual/promise/constructor";
let closureNs = {
  Base: Boolean
};
const set = () => {
  closureNs = {
    Base: _Promise
  };
};
set();