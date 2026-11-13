// A defined constructor alias needs no new nullish rejection.
// Global preserves the source; this row guards the injection surface.
const held = Array;
export const { [(effect(), "of")]: of } = held;
