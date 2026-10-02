// A setter after a data property resets the slot to a setter-only descriptor.
// Only the array default supplies the includes receiver.
const log = [];
const box = {
  toString: [8, 9],
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
