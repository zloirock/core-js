let kLeft = "parseFloat";
export function inForOfLeftDefault(items) {
  for (const { m = Number[kLeft]("1.5") } of items) { kLeft = "isInteger"; }
}
