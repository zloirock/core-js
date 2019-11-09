var userAgent = require('../internals/user-agent');

module.exports = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent);
