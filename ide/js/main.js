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

const settings = getModal({ 
  open: settingsOpen,
  close: settingsClose,
  background: settingsModal,
});

const changeName = getModal({
  close: changeNameClose,
  background: changeNameModal,
});

const removeTab = getModal({
  close: removeClose,
  background: removeModal,
});

const tabController = getTabs(tabs, changeName, removeTab);
if (tabController.isEmpty()) {
  tabController.loadFromArray([['Fibonacci', '@2\nM = 1\nM = D + M; out\nD = D + M; >; out']]);
  tabController.openTab(0);
}
run.click();
