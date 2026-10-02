// Reflect can replace an array getter with a string-valued own property.
const log = [];
const box = {
  get data() {
    return [8, 9];
  }
};
Reflect.defineProperty(box, "data", {
  value: "pq"
});
const r = box.data.includes("pq");
export { r };
export const effects = log;
