// minifier-shape destructure inside the `default` consequent only - confirms the
// SwitchCase visitor reaches default-branch consequent lists, not just labeled ones
function dispatch(n) {
  let from;
  switch (n) {
    case 0:
      from = () => [];
      break;
    default:
      (0, ({ from } = Array));
  }
  return from([1, 2]);
}
dispatch(99);
