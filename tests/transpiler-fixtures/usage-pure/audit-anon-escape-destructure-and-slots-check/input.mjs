const storedWritten = {};
storedWritten.f = { codes: 'kw', check() { return this.codes.includes('k'); } };
storedWritten.f.codes = 5;
storedWritten.f.check();
