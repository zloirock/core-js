// An unknown own key, spread or installed prototype prevents inherited-member narrowing.
// Every multi-family read keeps its conservative fallback.
use(({
  [key]: other
}).toString.at);
use(({
  ...other
}).valueOf.includes);
const box = {};
Object.setPrototypeOf(box, other);
use(box.hasOwnProperty.some);
