const getExecutor = () => {
  const breakpoints = [];
  let lines = [];
  let lineNumber = 0;
  let lineCounter = 0;
  let breakpointHit = false;
  let breakpointResolver = null;
  let maxLoopValue = Number(maxLoop.value);
  maxLoop.addEventListener('input', () => maxLoopValue = parseInt(maxLoop.value));

  const loadLines = () => {
    lines = code.getValue().toUpperCase().split('\n').map(line => line.trim().split('#')[0]);
    lineNumber = 0;
    lineCounter = 0;
    return lines.length;
  }

  const isDone = () => lineNumber >= lines.length;

  const iterate = async () => {
    lineNumber = await currentMachine.execute(lineNumber, lines[lineNumber]);
  }

  const run = async () => {
    if (loadLines()) {
      cclear();
      currentMachine = machines[language.value]();
      while (!isDone()) {
        await iterate();
        lineCounter += 1;
        if (lineCounter === lines.length + maxLoopValue) {
          cerr('Infinite loop protection', 'Runtime');
          break;
        }
      }
    }
  };

  const step = async () => {
    if ((lineCounter === 0 || !lines.length) && loadLines()) {
      cclear();
      currentMachine = machines[language.value]();
    }
    if (lines.length && !isDone()) {
      await iterate();
      lineCounter += 1;
    }
  };

  const next = async () => {
    if (breakpointHit) {
      breakpointResolver();
      return;
    }
    if ((lineCounter === 0 || !lines.length) && loadLines()) {
      cclear();
      currentMachine = machines[language.value]();
    }
    if (lines.length) {
      while (!isDone()) {
        if (breakpoints.indexOf(lineNumber) !== -1) {
          await breakpointRelease();
        }
        await iterate();
        lineCounter += 1;
        if (lineCounter >= lines.length + maxLoopValue) {
          cerr('Infinite loop protection', 'Runtime');
          break;
        }
      }
    }
  };

  const reset = () => {
    if (lineCounter !== 0) cout('Program reset, viewing previous state', 'Runtime', ['warning']);
    lines = [];
    lineNumber = 0;
    lineCounter = 0;
    breakpointHit = false;
    breakpointResolver = null;
  };

  const breakpointRelease = async () => {
    cout('Breakpoint hit', 'Runtime', ['warning']);
    breakpointHit = true;
    await new Promise(resolve => {
      breakpointResolver = resolve;
    });
    breakpointResolver = null;
    breakpointHit = false;
  };

  const toggleBreakpoint = line => {
    const index = breakpoints.indexOf(line);
    if (index === -1) {
      breakpoints.push(line);
      return true;
    } else {
      breakpoints.splice(index, 1);
      return false;
    }
  };

  let renderLineTimeout = -1;
  code.on('renderLine', () => {
    clearTimeout(renderLineTimeout);
    renderLineTimeout = setTimeout(() => {
      const gutters = [...document.querySelectorAll('.CodeMirror-linenumber.CodeMirror-gutter-elt')];
      for (const gutter of gutters) {
        if (!gutter.classList.contains('touched')) {
          gutter.addEventListener('click', ({ target }) => {
            if (toggleBreakpoint(parseInt(target.innerText))) {
              target.classList.add('marked');
            } else {
              target.classList.remove('marked');
            }
          });
          gutter.classList.add('touched');
        }
        if (breakpoints.indexOf(parseInt(gutter.innerText)) !== -1) gutter.classList.add('marked');
      }
    }, 16);
  });

  return { run, step, next, reset, toggleBreakpoint };
}
