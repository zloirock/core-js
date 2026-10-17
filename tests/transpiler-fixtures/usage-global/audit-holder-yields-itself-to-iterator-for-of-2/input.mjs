const viaSpread = {
  ...source,
  rows: [1, 2],
  read() {
    return this.rows.at(0);
  }
};
for (const el of viaSpread) sink(el);
