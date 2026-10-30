// The implicit read and the claim inside its fallback need distinct polyfills.
export function install(receiver) {
  receiver.at ||= () => [7].includes(7);
}
