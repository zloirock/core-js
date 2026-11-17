// Capturing an external constructor's result preserves its unknown family across array and string.
const held = new ExternalList();
held.at(-1);
