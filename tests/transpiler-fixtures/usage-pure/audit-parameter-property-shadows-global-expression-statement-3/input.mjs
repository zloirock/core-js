class Plain {
  constructor(public other: any) {
    // @ts-expect-error dynamic JS adds a member the declared type lacks
    this.own = new WeakSet();
  }
}
new Plain(1);
