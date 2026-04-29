class C extends Array {
  at() {
    return 'override';
  }
  toFn() {
    return function () {
      return this.at(0);
    };
  }
}
