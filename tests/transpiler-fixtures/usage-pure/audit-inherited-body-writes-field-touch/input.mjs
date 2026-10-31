class Base {
  touch() {
    this.rows = "text";
  }
}
class WrittenByBase extends Base {
  rows = [1, 2];
  read() {
    return this.rows.at(0);
  }
}
new WrittenByBase().touch();
