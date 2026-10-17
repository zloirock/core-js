class Bare {
  constructor(private WeakMap: any) {
    this.own = new WeakMap();
  }
}
new Bare(function () {});
