try {
  risky();
} catch ({ at: { name: viaCatch } = {} }) {
  use(viaCatch);
}
