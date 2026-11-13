// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return (effects.push("prefix"), globalThis).window?.globalThis.items?.at?.(-1);
}
