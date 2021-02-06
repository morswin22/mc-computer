const machines = {L: getLowLevelMachine, H: getHighLevelMachine};

const execute = () => {
  const lines = code.getValue().toUpperCase().split('\n').map(line => line.trim());
  const maxLoop = lines.length + 20;
  if (lines.length) {
    cclear();
    const machine = machines[language.value]();
    let i = 0, j = 0;
    while (i < lines.length) {
      const line = lines[i];
      i = machine.execute(i, line);
      machine.updateMemory();
      j++;
      if (j === maxLoop) {
        cerr('Max loop!');
        break;
      }
    }
  }
};

run.addEventListener("click", execute);
run.click();
