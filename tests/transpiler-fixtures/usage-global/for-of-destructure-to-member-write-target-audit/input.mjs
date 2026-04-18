const obj = {};
for ({ flat: obj.flat } of items) {
  noop(obj.flat);
}
