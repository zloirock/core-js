// TS lowers `namespace globalThis {}` to a SHADOWING local binding, so `globalThis.Map` below is
// a member access on the local, not the proxy global - the logical-assign diagnostic must stay
// SILENT (the member-form shadow check follows the binding through the threaded path). contrast
// the unshadowed twin fixture, which warns
namespace globalThis {
  export const Map: unknown = 1;
}
globalThis.Map ||= {};