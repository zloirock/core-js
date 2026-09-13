// A global inside a computed-key destructure receiver is substituted before the key runs.
// The literal is evaluated once, then the key effect precedes the instance-property read.
const { [(effectful(), 'flat')]: m } = [1, Promise];
const probe = [3].at(0);
