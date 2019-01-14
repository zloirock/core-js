'use strict';

var regexpExec = require('../internals/regexp-exec');

require('../internals/export')({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
  exec: regexpExec
});
