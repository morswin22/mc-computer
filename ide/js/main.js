const machines = {L: getLowLevelMachine, H: getHighLevelMachine};
let currentMachine;

const executor = getExecutor();

run.addEventListener("click", executor.run);
step.addEventListener("click", executor.step);
next.addEventListener("click", executor.next);
reset.addEventListener("click", executor.reset);

code.setValue("@2\nM = 1; out\nM = D + M; out\nD = M - D; >");
run.click();

const settings = getModal({ 
  open: settingsOpen,
  close: settingsClose,
  background: settingsModal,
});
