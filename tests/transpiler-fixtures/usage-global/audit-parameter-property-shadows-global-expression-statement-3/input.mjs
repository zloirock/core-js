class Plain {
  constructor(public other: any) {
    this.own = new WeakSet();
  }
}
new Plain(1);
