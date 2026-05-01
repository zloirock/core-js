import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// anonymous object literal invoked directly (`{...}.test()`) has no binding name, so
// no external code can target `<binding>.arr = ...` writes - the literal exists only
// for the duration of this expression. closure is empty: scan finds zero matching writes,
// candidates fold from init alone, narrow proceeds. demonstrates that an anonymous literal
// is sound for partial scan rather than full bail (no name -> no external write channel)
({
  arr: [1, 2, 3],
  test() {
    var _ref;
    return _atMaybeArray(_ref = this.arr).call(_ref, 0);
  }
}).test();