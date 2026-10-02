import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
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
const r = _includes(_ref = box.data).call(_ref, "pq");
export { r };
export const effects = log;