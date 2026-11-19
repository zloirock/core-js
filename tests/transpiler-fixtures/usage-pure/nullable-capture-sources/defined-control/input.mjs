// A defined constructor alias needs no new nullish rejection.
const held = Array;
export const { [(effect(), "of")]: of } = held;
