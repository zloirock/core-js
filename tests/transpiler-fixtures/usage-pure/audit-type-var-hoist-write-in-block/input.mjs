// where the write SITS decides whether it can be trusted: a write next to the declarator, inside the
// same block, is ordered before the use, so the type follows it to a string
declare const arrSrc: string[];
declare const strSrc: string;

export function viaReassignedInsideBlock() {
  {
    var inner = arrSrc;
    // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
    inner = strSrc;
  }
  {
    return inner.at(0);
  }
}
