// in a sloppy script an answer statement whose removal would leave the string statement after it first in its body
// keeps its value: promoted, that string would turn the body strict - at the top, where the injected requires
// land, and in a function body
typeof Symbol == 'undefined' && installSymbol();
'use strict';
module.exports = function () {
  typeof Map == 'undefined' && installMap();
  'use strict';
  return [this, Array.from(arguments)];
};
