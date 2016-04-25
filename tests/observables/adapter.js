delete global.Observable;
require('../../shim');
require('../../modules/es7.observable');
require('es-observable-tests').runTests(Observable);