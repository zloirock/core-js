class Foo {
  date: Date = new Date();
  getDate() {
    return this.date;
  }
}
Object.freeze(new Foo().getDate());