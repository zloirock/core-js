// A data property breaks a getter/setter pair, so the final setter reads undefined.
// Only the array default supplies the includes receiver.
const log = [];
const box = {
  get toString() {
    return [8, 9];
  },
  toString: [1],
  set toString(value) {}
};
const {
  toString: {
    includes
  } = (log.push("default"), [8, 9])
} = box;
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;
