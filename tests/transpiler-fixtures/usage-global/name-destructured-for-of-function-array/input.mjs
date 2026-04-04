function process(fns: (() => void)[]) {
  for (const { name } of fns) {
    name.at(0);
  }
}
