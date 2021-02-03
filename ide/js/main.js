const cclear = () => iconsole.innerHTML = '';
const cout = message => {
  const el = document.createElement('div');
  el.innerText = message;
  iconsole.appendChild(el);
};

const getLowLevelMachine = () => {
  let a = 0, d = 0;
  const m = Array(16).fill(0);

  const dataRegex = /@ *(-?)(\d+)/;

  const execute = line => {
    if (dataRegex.test(line)) {
      const [, sign, number] = dataRegex.exec(line);
      const value = parseInt(`${sign}${number}`);
      a = value;
    } else {
      console.log(line);
    }
  }

  const aOut = document.createElement('div');
  const dOut = document.createElement('div');
  const mOut = document.createElement('div');
  memory.innerHTML = '';
  memory.append(aOut, dOut, mOut);

  const updateMemory = () => {
    aOut.innerText = `A = ${a}`;
    dOut.innerText = `D = ${d}`;
    mOut.innerHTML = '<hr>RAM:<br>';
    for (let i in m) {
      mOut.innerHTML += `[${i}] ${m[i]}<br>`;
    }
  }

  updateMemory();
  return { execute, updateMemory };
};

const getHighLevelMachine = () => {
  const execute = line => {};
  const updateMemory = () => {};
  return { execute, updateMemory };
};

const machines = {L: getLowLevelMachine, H: getHighLevelMachine};

const execute = () => {
  const lines = code.value.split('\n').map(line => line.trim()).filter(line=>line);
  if (lines.length) {
    cclear();
    const machine = machines[language.value]();
    for (const line of lines) {
      machine.execute(line);
      machine.updateMemory();
    }
  }
};

run.addEventListener("click", execute);