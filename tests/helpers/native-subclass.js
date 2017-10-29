global.nativeSubclass = function () {
  try {
    return Function("'use strict';class O extends Object {};return new O instanceof O;")()
      && Function('F', "'use strict';return class extends F {};");
  } catch (e) { /* empty */ }
}();
