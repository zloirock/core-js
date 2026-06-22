// An assignment-WRITE target rebinds the binding - it is not a leaking reference. A binding written via
// destructuring (`({ o } = v)`) and/or compound assignment (`o += v`) keeps the per-element narrow when
// read only locally (`this.data.at` -> `_atMaybeArray`). A genuine leak still escapes: handing the bound
// array to external code drops to the generic helper (`this.data.includes` -> `_includes`). babel omits
// these constantViolations from its reference set and the resolver mirrors that for both parsers.
declare function sink(v: unknown): void;
let written: any;
({ written } = ({} as any));
written.f = [{ data: ["a"], read() { return this.data.at(0); } }];
written.f[0].read();
written += 1;
let leaked: any;
({ leaked } = ({} as any));
leaked = [{ data: ["b"], scan() { return this.data.includes("z"); } }];
sink(leaked);
