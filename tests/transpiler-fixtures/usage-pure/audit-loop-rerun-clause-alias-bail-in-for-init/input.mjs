// Once-per-entry does not mean once over the lifetime of the outer binding.
let kInit = "fromEntries";
export function inForInit() {
  for (let acc = Object[kInit]([["a", 1]]); false; kInit = "keys") { return acc; }
}
