// A nested assignment may write a member after one receiver read and one default.
let stored;
const target = {
  set method(value) {
    stored = value;
  }
};
const receiver = {
  get at() {
    effect();
    return undefined;
  }
};
({
  slot: {
    at: target.method = fallback()
  }
} = {
  slot: receiver
});