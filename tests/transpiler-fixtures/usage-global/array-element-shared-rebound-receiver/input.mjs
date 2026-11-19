// Each key is read independently from one receiver, even if a getter rebinds its source.
export function read(make) {
  let receiver = make(() => { receiver = replacement(); });
  const [{ at, includes }] = [receiver];
  return [at, includes];
}
