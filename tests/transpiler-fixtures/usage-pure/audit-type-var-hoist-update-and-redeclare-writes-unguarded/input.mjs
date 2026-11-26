declare const unionSrc: string[] | string;
declare const strItems: string[];

export function viaUpdate() {
  {
    var bumped = strItems;
  }
  // @ts-expect-error a numeric update of a declared string or array is the shape under test
  bumped++;
  return bumped.at(0);
}

export function viaRedeclare() {
  {
    var redeclared = unionSrc;
  }
  {
    // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
    var redeclared = strItems;
  }
  return redeclared.includes("x");
}
