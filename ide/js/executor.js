const getExecutor = () => {
  let breakpoints = [];
  let lines = [];
  let lineNumber = 0;
  let lineCounter = 0;
  let breakpointHit = false;
  let breakpointResolver = null;
  let breakpointResetHandler = null;
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
    const response = await currentMachine.execute(lineNumber, lines[lineNumber]);
    if (response === false) return true;
    lineNumber = response;
  }

  const run = async () => {
    if (loadLines()) {
      cclear();
      currentMachine = machines[language.value]();
      while (!isDone()) {
        if (await iterate()) break;
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
      try {
        while (!isDone()) {
          if (breakpoints.indexOf(lineNumber) !== -1) {
            await breakpointRelease();
          }
          if (await iterate()) break;
          lineCounter += 1;
          if (lineCounter >= lines.length + maxLoopValue) {
            cerr('Infinite loop protection', 'Runtime');
            break;
          }
        }
      } catch(e) {
        if (e === 'debug-off') {
          reset();
        } else {
          console.error('Unknown error', e);
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
    await new Promise((resolve, reject) => {
      breakpointResolver = resolve;
      breakpointResetHandler = reject;
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

  const gutterClickHandler = ({ target }) => {
    if (toggleBreakpoint(parseInt(target.innerText))) {
      target.classList.add('marked');
    } else {
      target.classList.remove('marked');
    }
  }

  const renderLineHandler = () => {
    const gutters = [...document.querySelectorAll('.CodeMirror-linenumber.CodeMirror-gutter-elt')];
    for (const gutter of gutters) {
      if (!gutter.classList.contains('touched')) {
        gutter.addEventListener('click', gutterClickHandler);
        gutter.classList.add('touched');
      }
      if (breakpoints.indexOf(parseInt(gutter.innerText)) !== -1) gutter.classList.add('marked');
    }
  };

  let renderLineTimeout = -1;
  code.on('renderLine', () => {
    if (showBreakpoints.checked) {
      clearTimeout(renderLineTimeout);
      renderLineTimeout = setTimeout(renderLineHandler, 16);
    }
  });

  showBreakpoints.addEventListener('change', () => {
    if (showBreakpoints.checked) {
      code.setOption('styleActiveLine', false);
      renderLineHandler();
      document.getElementById('next').classList.remove('hide');
    } else {
      const gutters = [...document.querySelectorAll('.CodeMirror-linenumber.CodeMirror-gutter-elt.touched')];
      for (const gutter of gutters) {
        gutter.classList.remove('touched', 'marked');
        gutter.removeEventListener('click', gutterClickHandler);
      }
      breakpoints = [];
      if (breakpointResetHandler) breakpointResetHandler('debug-off');
      document.getElementById('next').classList.add('hide');
      code.setOption('styleActiveLine', true);
    }
  });

  return { run, step, next, reset, toggleBreakpoint };
}
