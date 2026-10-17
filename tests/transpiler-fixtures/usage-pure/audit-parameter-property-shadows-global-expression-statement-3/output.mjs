import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
class Plain {
  constructor(public other: any) {
    this.own = new _WeakSet();
  }
}
new Plain(1);