let kRight = "fromCodePoint";
export function inForOfRight() {
  const chars = [];
  for (const ch of String[kRight](66, 67)) { chars.push(ch); kRight = "raw"; }
  return chars;
}
