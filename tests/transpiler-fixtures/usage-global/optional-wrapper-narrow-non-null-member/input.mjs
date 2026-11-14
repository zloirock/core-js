// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  const effects = [];
  let w: any = globalThis;
  if (choice) w = null;
  return w?.Map!.groupBy([1], (x: number) => x).size;
}
