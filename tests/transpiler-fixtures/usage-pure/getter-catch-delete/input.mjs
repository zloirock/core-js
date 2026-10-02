// A caught receiver can lose its getter and expose the inherited string.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  }
};
try {
  throw box;
} catch (e) {
  delete e.data;
}
const r = box.data.includes("pq");
export { r };
export const effects = log;
