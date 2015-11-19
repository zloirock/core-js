var core = require('../../modules/$.core');
module.exports = core.JSON || (core.JSON = {stringify: JSON.stringify});