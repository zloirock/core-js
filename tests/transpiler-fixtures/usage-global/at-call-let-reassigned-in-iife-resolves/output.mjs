import "core-js/modules/es.string.at";
let x = [];
(() => {
  x = "hello";
})();
x.at(-1);