function foo(): [string, string] { return ['a', 'b']; }
foo().sort().at(0).includes('x');
