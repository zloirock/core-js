class Stat {
  static words = 'wv';
  static ask() { return this.words.includes('w'); }
}
const m3 = Stat.ask;
m3.call({ words: [3] });
