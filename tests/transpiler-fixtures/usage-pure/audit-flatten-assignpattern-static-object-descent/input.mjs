// A literal namespace keeps its native entries read and dead inner receiver default.
// The known result type still narrows the later includes call.
const wrapper = { ns: Object };
const { ns: { entries } = {} } = wrapper;
const arr = entries({ k: 1 });
arr.includes(['k', 1]);
