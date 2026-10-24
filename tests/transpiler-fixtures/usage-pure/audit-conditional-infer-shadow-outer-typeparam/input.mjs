// `infer U` inside the conditional must shadow the outer alias type-param U during substitution.
// Without alpha-rename guard, the trueType reference would capture the outer U and lose the inferred element.
type Pull<T, U> = T extends (infer U)[] ? U : never;
declare const a: Pull<string[], number>;
declare const b: Pull<number[], string>;
a.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
b.includes(1);
