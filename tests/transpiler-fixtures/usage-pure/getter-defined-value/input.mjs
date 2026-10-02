// Replacing an array getter with a string value invalidates the getter return proof.
const log = [];
const box = {
  get data() {
    return [8, 9];
  }
};
Object.defineProperty(box, "data", {
  value: "pq"
});
const r = box.data.includes("pq");
export { r };
export const effects = log;
