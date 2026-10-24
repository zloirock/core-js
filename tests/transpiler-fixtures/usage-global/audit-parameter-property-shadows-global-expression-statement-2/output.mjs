class Bare {
  constructor(private WeakMap: any) {
    // @ts-expect-error dynamic JS adds a member the declared type lacks
    this.own = new WeakMap();
  }
}
new Bare(function () {});