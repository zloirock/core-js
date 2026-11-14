// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  const effects = [];
  const w: any = typeof window !== "undefined" ? window : undefined;
  const values = [];
  values.push(w?.Array.of((effects.push("arg"), 3))!.length);
  return values[0];
}
