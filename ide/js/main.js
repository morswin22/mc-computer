const machines = {L: getLowLevelMachine, H: getHighLevelMachine};
let currentMachine;

const executor = getExecutor();

run.addEventListener("click", executor.run);
step.addEventListener("click", executor.step);
next.addEventListener("click", executor.next);
reset.addEventListener("click", executor.reset);
compileBits.addEventListener("input", executor.reset);
compileDataType.addEventListener("change", executor.reset);
compileMemorySize.addEventListener("change", executor.reset);

compileBits.addEventListener("input", () => {
  const maxMemory = 2**parseInt(compileBits.value);
  compileMemorySize.max = maxMemory;
  compileMemorySize.value = Math.min(maxMemory, parseInt(compileMemorySize.value));
});

code.setValue("@2\nM = 1; out\nM = D + M; out\nD = M - D; >");
run.click();

const settings = getModal({ 
  open: settingsOpen,
  close: settingsClose,
  background: settingsModal,
});
