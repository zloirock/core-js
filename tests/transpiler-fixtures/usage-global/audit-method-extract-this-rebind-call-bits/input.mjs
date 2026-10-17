class Proto {
  bits = [4];
  poke() { return this.bits.at(4); }
}
const m4 = Proto.prototype.poke;
m4.call({ bits: 'bb' });
