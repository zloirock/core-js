import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
export function viaNonNull(c) {
  let I: any;
  if (c) I = _Iterator;
  return (I === _Iterator ? _Iterator$zip : I.zip.bind(I))!([[1], [2]]);
}
export const r = [viaNonNull(true)];