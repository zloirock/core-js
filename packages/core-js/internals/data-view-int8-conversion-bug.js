'use strict';
var testView = new DataView(new ArrayBuffer(2));
testView.setInt8(0, 2147483648);
testView.setInt8(1, 2147483649);

// iOS Safari 7.x bug
module.exports = !!testView.getInt8(0) || !testView.getInt8(1);
