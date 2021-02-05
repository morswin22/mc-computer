CodeMirror.defineSimpleMode("low-level", {
  start: [
    {regex: /#.*/, token: "comment"},
    {regex: /out|in|swap/i, token: "atom"},
    {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
    {regex: /[~^\-+=<>!@;]+/, token: "operator"},
    {regex: /a|m|d/i, token: "variable"},
  ],
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "#"
  }
});

// Autorun Fibonacci sequence
const code = CodeMirror(document.querySelector('.code'), {
  value: "@2\nM = 1; out\nM = D + M; out\nD = M - D; >",
  mode:  "low-level",
  theme: "low-level",
  lineNumbers: true,
  firstLineNumber: 0,
});