class Proto {
  bits = [4];
  poke() { return this.bits.at(4); }
}
new Proto().poke();
