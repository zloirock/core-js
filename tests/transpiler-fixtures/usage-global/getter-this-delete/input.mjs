// A receiver method can delete its own getter before the next read.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  },
  remove() {
    delete this.data;
  }
};
box.remove();
const r = box.data.includes("pq");
export { r };
export const effects = log;
