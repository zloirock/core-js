delete global.Observable;
var core = require('../../library');
global.Promise = core.Promise;
global.Symbol  = core.Symbol;
require('es-observable-tests').runTests(core.Observable);