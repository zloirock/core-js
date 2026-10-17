import "core-js/modules/es.array.includes";
const localCarrier = {};
localCarrier.g = [{
  list: [7],
  has() {
    return this.list.includes(7);
  }
}];
localCarrier.g[0].has();