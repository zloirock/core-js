// A method body can replace the receiver prototype before an inherited read.
const log = [];
const box = {
  setup() {
    Object.setPrototypeOf(this, {
      toString: "pq"
    });
  }
};
box.setup();
const r = box.toString.includes("pq");
export { r };
export const effects = log;
