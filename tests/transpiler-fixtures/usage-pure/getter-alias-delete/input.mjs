// Deleting a getter through an alias invalidates the getter return family.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  }
};
const alias = box;
delete alias.data;
const r = box.data.includes("pq");
export { r };
export const effects = log;
