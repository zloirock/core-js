export function viaNearerLet() {
  { var Symbol = { iterator: 'v' }; }
  {
    let Symbol = { iterator: 'l' };
    return [][Symbol.iterator];
  }
}
