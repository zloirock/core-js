// Parentheses around a nullable base do not prevent its guarded static from being served.
export function read(choice) {
  const effects = [];
  let w: any = globalThis;
  if (choice) w = null;
  return ((w))?.Array.from((effects.push("arg"), [3]))[0];
}
