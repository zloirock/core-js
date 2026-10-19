import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
class Plain {
  constructor(public other: any) {
    // @ts-expect-error dynamic JS adds a member the declared type lacks
    this.own = new _WeakSet();
  }
}
new Plain(1);