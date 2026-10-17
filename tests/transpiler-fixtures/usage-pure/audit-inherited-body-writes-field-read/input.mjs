class BuiltInBase extends Array {
  cells = [1, 2];
  read() {
    return this.cells.at(0);
  }
}
new BuiltInBase().read();
