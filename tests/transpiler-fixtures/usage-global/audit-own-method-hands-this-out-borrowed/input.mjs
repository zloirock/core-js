const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    return this.slots.find(x => x);
  }
};
viaSpread.borrowed();
