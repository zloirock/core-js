const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    return this.slots.includes(1);
  }
};
viaSpread.borrowed();
