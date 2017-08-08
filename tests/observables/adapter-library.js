delete global.Observable;
var core = require('../../library');
require('../../library/modules/esnext.observable');
global.Promise = core.Promise;
global.Symbol  = core.Symbol;
require('es-observable-tests').runTests(core.Observable);