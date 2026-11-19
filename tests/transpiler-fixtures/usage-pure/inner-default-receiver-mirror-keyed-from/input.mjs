// A defined keyed slot makes its Array receiver default dead.
// The supported from extraction still uses the selected slot's constructor.
const { k: { from: keyedFrom } = Array } = { k: Array };
export { keyedFrom };
