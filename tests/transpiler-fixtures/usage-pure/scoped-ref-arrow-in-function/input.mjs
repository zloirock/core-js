function process(items) {
  return items.map(x => getArr(x).at(-1));
}
