'use strict';
var testView = new DataView(new ArrayBuffer(2));
testView.setInt8(0, 2147483648);
testView.setInt8(1, 2147483649);

// NodeJS 0.11.4 and iOS Safari 7.x truncate large values incorrectly
module.exports = !!testView.getInt8(0) || !testView.getInt8(1);
