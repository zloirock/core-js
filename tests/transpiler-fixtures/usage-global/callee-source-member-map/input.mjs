// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const o = {
  make() {
    effects.push("callee");
    return Array;
  }
};
r = [3, 4].map(x => o.make().from([x]));
export { r, effects };
