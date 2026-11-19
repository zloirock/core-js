let switched = 0;
switch (1) {
  case 1: switched = globalThis.window?.self.Math.hypot(3, 4); break;
  default: break;
}
export { switched };
