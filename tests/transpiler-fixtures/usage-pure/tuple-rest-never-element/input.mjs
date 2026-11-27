type Selected = [any] extends [...never[]] ? number[] : string;
export function last(value: Selected) { return value.at(-1); }
