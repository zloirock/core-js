// the identity self-copy exemption trusts its proxy receiver; a file that also REPLACES
// that receiver's slot turns the copy into a real install - both textual orders record
String = self.String;
self = { Promise: class FakePromise {} };
Promise = self.Promise;
export const copiedBefore = String.cooked(['a']);
export const copiedAfter = Promise.try(() => 1);
// an untouched builtin keeps its substitution - the deopt is per-name
export const control = Array.from('ab');
