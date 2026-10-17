import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
// An unchanged getter keeps its array family and runs once per source read.
const log = [];
const box = {
  get data() {
    log.push("get");
    return [8, 9];
  }
};
const r = box.data.includes(9);
export { r };
export const effects = log;