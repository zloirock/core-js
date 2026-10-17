function afterSwitch(x) {
  switch (x) {
    case 1:
      let Symbol = x;
      return Symbol;
  }
  return [][Symbol.iterator];
}
export { afterSwitch };
