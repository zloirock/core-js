type NotThenable = {
  then: string,
};
async function bailProbe(d: NotThenable) {
  (await d).at(0);
}
bailProbe();
