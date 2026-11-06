import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// the plainest two channels a hoisted `var` answers through: its own declared type, and a member read
// off it. one method each, so the import set attributes per row - both narrow, so neither string leg
// may appear
declare const arrSrc: string[];
declare const objSrc: {
  a: string[];
  v: string[];
};
export function viaBindingType() {
  {
    var held = arrSrc;
  }
  {
    return held.at(0);
  }
}
export function viaMemberField() {
  {
    var obj = objSrc;
  }
  {
    return obj.a.includes("x");
  }
}