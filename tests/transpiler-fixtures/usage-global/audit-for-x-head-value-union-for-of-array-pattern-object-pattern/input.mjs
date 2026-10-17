// a NESTED pattern head pairs through inner slots too
let Z = Object;
for ([{ z: Z }] of [[{ z: Promise }]]) { break; }
