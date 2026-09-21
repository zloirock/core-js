// A const-bound container supplies a static through an inner pattern default.
// The known constructor keeps that default dead.
const wrapper = { ns: Object };
const { ns: { entries } = {} } = wrapper;
const arr = entries({ k: 1 });
arr.includes(['k', 1]);
