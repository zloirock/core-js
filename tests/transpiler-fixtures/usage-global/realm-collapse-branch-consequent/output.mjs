import "core-js/modules/es.global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  const x = {
    window: {
      slotD: 23
    }
  };
  const d = delete (choice ? globalThis : x).window.slotD;
  return [d, x.window.slotD];
}