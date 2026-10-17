import _includes from "@core-js/pure/actual/instance/includes";
class Stat {
  static words = 'wv';
  static ask() {
    var _ref;
    return _includes(_ref = this.words).call(_ref, 'w');
  }
}
const m3 = Stat.ask;
m3.call({
  words: [3]
});