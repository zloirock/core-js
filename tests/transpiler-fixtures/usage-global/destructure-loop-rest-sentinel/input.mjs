// Static rest exclusions in both loop slots declare their sentinels outside the header.
let from, rest, index = 0;
for (({ from, ...rest } = Array); index < 2; index++, ({ from, ...rest } = Array)) {
  use(from([index]), rest);
}
