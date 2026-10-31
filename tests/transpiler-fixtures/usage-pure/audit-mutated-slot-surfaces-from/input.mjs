// a CALL-EXPRESSION mutation receiver records like an identifier one: the scoped stage
// inlines the transparent call, so the cheap gate must fire for it too
const getArr = () => Array;
getArr().from = myFrom;
use(Array.from(x));
