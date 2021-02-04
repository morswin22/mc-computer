const cclear = () => iconsole.innerHTML = '';
const cout = message => {
  const el = document.createElement('div');
  el.innerText = message;
  iconsole.appendChild(el);
};

const getLowLevelMachine = () => {
  let a = 0, d = 0;
  const m = Array(2**4).fill(0);

  const dataRegex = /@ *(-?)(\d+)/;
  const operationRegex = /([ADM, ]*=[ADM, &\|~01+\-]+)?;? *([!><]?=?)?;? *(OUT)?/;

  const jumpRules = {
    "!": () => null,
    "!=": value => value != 0,
    "<=": value => value <= 0,
    ">=": value => value >= 0,
    "=": value => value == 0,
    ">": value => value > 0,
    "<": value => value < 0,
  };

  const validOpcodes = ["X", "Y", "X&Y", "X|Y", "~X", "~Y", "X+Y", "X-Y", "Y-X", "0", "-1", "1", "-X", "-Y", "X+1", "Y+1", "X-1", "Y-1"];

  const execute = (i, line) => {
    if (dataRegex.test(line)) {
      const [, sign, number] = dataRegex.exec(line);
      const value = parseInt(`${sign}${number}`);
      a = value;
    } else if (operationRegex.test(line)) {
      const [, operation, jump, out] = operationRegex.exec(line);
      let operationResult = undefined;
      if (operation) {
        const [left, right] = operation.split('=').map(side => side.split('').filter(char => char.trim()));

        const X = d;
        const Y = (right.indexOf('M') != -1) ? m[a] : a;

        const opcode = right.join('').replace('D', 'X').replace(/[AM]+/, 'Y');
        if (validOpcodes.indexOf(opcode) != -1) {
          eval(`operationResult = ${opcode}`);
        }

        if (out) cout(operationResult);

        if (left.indexOf('M') != -1) m[a] = operationResult;
        if (left.indexOf('A') != -1) a = operationResult;
        if (left.indexOf('D') != -1) d = operationResult;
      }
      if (jump && operationResult !== undefined && jumpRules[jump](operationResult)) {
        return a;
      }
    } else {
      console.log(line);
    }
    return i + 1;
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
      mOut.innerHTML += `${(i==a) ? '>' : '&nbsp;'}[${i}] ${m[i]}<br>`;
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
  const lines = code.value.toUpperCase().split('\n').map(line => line.trim()).filter(line=>line);
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
        console.error('Max loop!');
        break;
      }
    }
  }
};

run.addEventListener("click", execute);

code.value = "@2\nM = 1; out\nM = D + M; out\nD = M - D; >";
