export function sibling(kind) {
  const list = [[1]];
  switch (kind) {
    case 1:
      let Reflect = 1;
      break;
    case 2:
      if (typeof Reflect == 'object') list[0] = 'abc';
      return list[0].at(0);
  }
}
