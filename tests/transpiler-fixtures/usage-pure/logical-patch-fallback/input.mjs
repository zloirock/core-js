// The implicit read may fall back on an open receiver.
// A claim inside the source RHS still needs its own polyfill.
export function install(receiver) {
  receiver.at ||= () => [7].includes(7);
}
