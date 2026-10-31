class C {
  static at(i) {
    return 'custom-' + i;
  }
  static {
    console.log(this.at(0));
  }
}