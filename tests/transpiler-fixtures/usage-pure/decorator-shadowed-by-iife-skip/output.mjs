(function () {
  const Promise = fn => fn;
  @Promise
  class Local {}
  return Local;
})();