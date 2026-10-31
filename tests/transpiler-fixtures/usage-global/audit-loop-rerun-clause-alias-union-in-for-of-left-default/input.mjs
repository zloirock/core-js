export function inForOfLeftDefault(items) {
  let kLeft = "parseFloat";
  for (const { m = Number[kLeft]("1.5") } of items) { kLeft = "isInteger"; }
}
