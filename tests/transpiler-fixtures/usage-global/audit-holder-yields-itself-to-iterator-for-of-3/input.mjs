const plain = {
  cells: [1, 2],
  read() {
    return this.cells.includes(1);
  }
};
for (const el of plain) sink(el);
