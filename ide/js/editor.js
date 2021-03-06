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
  mode:  "low-level",
  theme: "low-level",
  lineNumbers: true,
  firstLineNumber: 0,
  scrollbarStyle: "overlay",
  lineWrapping: true,
  styleActiveLine: true,
});
