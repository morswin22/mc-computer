const machines = {L: getLowLevelMachine, H: getHighLevelMachine};
let currentMachine;

const execute = () => {
  const lines = code.getValue().toUpperCase().split('\n').map(line => line.trim());
  const maxLoop = lines.length + 20;
  if (lines.length) {
    cclear();
    currentMachine = machines[language.value]();
    let i = 0, j = 0;
    while (i < lines.length) {
      const line = lines[i];
      i = currentMachine.execute(i, line);
      currentMachine.updateMemory();
      j++;
      if (j === maxLoop) {
        cerr('Infinite loop protection', 'Runtime');
        break;
      }
    }
  }
};

run.addEventListener("click", execute);
run.click();
