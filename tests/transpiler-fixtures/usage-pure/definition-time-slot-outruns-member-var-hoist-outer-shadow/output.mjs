function outerShadow() {
  var Promise = 4;
  class D {
    [Promise.resolve(5)]() {
      var Promise = 6;
    }
  }
  return D;
}
export { outerShadow };