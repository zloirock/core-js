// pure flavor: the own data property under a built-in's name needs no helper at all while the
// receiver is provable, and the field it holds keeps its precise family. the leaked twin loses
// both - the collision becomes a real instance-method access and the field widens
const bag = {
  entries: [1, 2],
  read() {
    return this.entries.at(0);
  }
};
bag.read();
export const leaked = {
  keys: [1, 2],
  read() {
    return this.keys.includes(1);
  }
};
