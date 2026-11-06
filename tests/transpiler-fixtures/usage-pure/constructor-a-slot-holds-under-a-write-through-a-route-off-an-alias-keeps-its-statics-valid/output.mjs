import _URL from "@core-js/pure/actual/url";
const parsed = {
  C: _URL
};
const tail = parsed;
const link = flag ? first : tail;
const head = flag ? second : link;
head.C = userValue;
export const valid = parsed.C.canParse('a:b');