// A realm write in a computed key invalidates later constructor inference.
class C { [(this.Array = Replacement, 'method')]() {} }
Array.from('abc').at(-1);
