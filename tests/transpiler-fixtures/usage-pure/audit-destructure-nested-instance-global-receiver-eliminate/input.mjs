// nested instance method whose dead residual is eliminated (sole binding, pure init): the whole
// declaration becomes the extracted call, which re-emits the receiver. a global nested in the literal
// receiver must be substituted in that copy too
const { y: { flat: m } } = { y: [1, Promise] };
