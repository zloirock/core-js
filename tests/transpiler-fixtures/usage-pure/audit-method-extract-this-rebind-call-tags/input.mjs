const plucked = { tags: 'ab', scan() { return this.tags.includes('a'); } };
const { scan } = plucked;
scan.call({ tags: ['q'] });
