// A field value reads the new instance, so it does not expose the enclosing caller's receiver.
function read() { class C { value = this; } return new C().value; }
consume(read.call(Map));
