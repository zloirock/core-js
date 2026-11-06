// The optional still observes the stored value when a later instance call is claimed.
let held;
export const first = (held = window)?.self.items.at(0);
export const value = (box.held = window)?.self.items;
