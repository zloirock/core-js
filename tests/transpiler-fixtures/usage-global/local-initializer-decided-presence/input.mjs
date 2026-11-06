// A build-decided initializer contributes only its live value to later local reads.
export function read(flag) {
  let value = typeof Promise !== "undefined" ? "ab" : ["x"];
  if (flag) value = "cd";
  return value.at(0);
}
