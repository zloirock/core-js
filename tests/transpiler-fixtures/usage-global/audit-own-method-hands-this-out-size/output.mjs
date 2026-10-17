import "core-js/modules/es.array.includes";
const readsOnly = {
  cells: [1, 2],
  size() {
    return this.cells.length;
  },
  read() {
    return this.cells.includes(1);
  }
};
readsOnly.size();