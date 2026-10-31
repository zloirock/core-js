const called = { list: [2], has() { return this.list.includes(2); } };
called.has.call({ list: 'pq' });
