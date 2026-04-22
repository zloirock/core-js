import "core-js/modules/es.promise.try";
let x = function () {
  return 42;
}(function () {
  Promise.try(() => 1);
})();