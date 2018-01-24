// 20.3.3.1 / 15.9.4.4 Date.now()
require('./_export')({ target: 'Date', stat: true }, { now: function () { return new Date().getTime(); } });
