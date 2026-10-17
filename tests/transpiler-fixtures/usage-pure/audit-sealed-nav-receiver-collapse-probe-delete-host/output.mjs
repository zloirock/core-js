import _self from "@core-js/pure/actual/self";
// a WRITE host is a member access like any other, and a `delete` is one too - but both PERFORM the
// act the nav leads to, so the `?.` over the environment probe decides whether it lands and stays
// as the guard. it stays whatever spells the run below the probe: reading it off a span pure lands
// always-defined (`globalThis.self`) makes the hop no less the host environment
export function writeHost(v) {
  (null == _self.window ? void 0 : _self).Box = v;
}
export const deleteHost = () => delete (null == _self.window ? void 0 : _self).Box;