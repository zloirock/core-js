var userAgent = require('../internals/engine-user-agent');

// dirty ie9- check
module.exports = /MSIE .\./.test(userAgent);
