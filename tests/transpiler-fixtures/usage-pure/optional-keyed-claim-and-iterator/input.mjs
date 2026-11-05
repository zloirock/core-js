// Check key and argument order across a live call, a missing method and a sealed lookup.
export function run(box, key, arg) {
  const read = box?.rows[(key(), 'at')];
  const value = box?.rows[(key(), 'at')]?.(arg())?.toFixed(0);
  const item = box.make?.()[(key(), Symbol.iterator)]().next().value;
  const sealed = (box?.rows?.[(key(), 'at')])(arg());
  return [read, value, item, sealed];
}
