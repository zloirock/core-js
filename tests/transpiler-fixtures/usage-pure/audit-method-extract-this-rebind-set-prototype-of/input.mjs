const inherited = { seq: 'st', find2() { return this.seq.includes('s'); } };
const heir = {};
Object.setPrototypeOf(heir, inherited);
