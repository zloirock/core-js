delete global.Observable;
require('../../shim');
require('../../modules/esnext.observable');
require('es-observable-tests').runTests(Observable);