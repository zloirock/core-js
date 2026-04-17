let from;
({ from } = (wrap({ fn: () => { const { of } = (innerCall(), Array); } }), Array));
