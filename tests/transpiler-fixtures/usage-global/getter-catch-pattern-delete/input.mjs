// A destructured catch alias can delete the installed getter.
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
  throw {
    box
  };
} catch ({
  box: e
}) {
  delete e.data;
}
const r = box.data.includes("pq");
export { r };
export const effects = log;
