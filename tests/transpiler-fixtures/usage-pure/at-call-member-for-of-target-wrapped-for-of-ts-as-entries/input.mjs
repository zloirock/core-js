// for-await rebinds the slot the same way as the sync loop
const l = [16];
for await ((l as any).entries of fns) {
  l.entries();
}
