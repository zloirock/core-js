// A loop writes a replacement constructor into an array alias before a nested pattern reads it.
// The raw static read needs the whole pure entry on the substituted value.
let viaLoop = [Array];
export const loopWrite = [];
for (let i = 0; i < 2; i++) {
  viaLoop = [Promise];
  const [{ allSettled }] = viaLoop;
  loopWrite.push(allSettled);
}
