const cclear = () => iconsole.innerHTML = '';
const cout = message => {
  const el = document.createElement('div');
  el.innerText = message;
  iconsole.appendChild(el);
};
const cerr = message => {
  const el = document.createElement('div');
  el.innerText = message;
  el.classList.add('error');
  iconsole.appendChild(el);
};

const setupMemoryOutput = (scalarsN, vectorsN, vectorsNames) => {
  const scalars = document.createElement('fieldset');
  scalars.classList.add('scalars');
  const scalarsLegend = document.createElement('legend');
  scalarsLegend.innerText = 'Registers';
  scalars.appendChild(scalarsLegend);

  const scalarElements = [];
  for (let i = 0; i < scalarsN; i++) {
    const element = document.createElement('div');
    scalarElements.push(element);
    scalars.appendChild(element);
  }

  const vectors = document.createElement('div');
  vectors.classList.add('vectors');

  const vectorElements = [];
  for (let i = 0; i < vectorsN; i++) {
    const vectorFieldset = document.createElement('fieldset');
    const vectorLegend = document.createElement('legend');
    const element = document.createElement('table');
    vectorLegend.innerText = vectorsNames[i];
    vectorFieldset.append(vectorLegend, element);
    vectorElements.push(element);
    vectors.appendChild(vectorFieldset);
  }

  memory.innerHTML = '';
  memory.append(scalars, vectors);

  return {scalars: scalarElements, vectors: vectorElements}
}

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
    if (!line) return i + 1;
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

  const {scalars: [aOut, dOut], vectors: [mOut]} = setupMemoryOutput(2, 1, ['Memory']);

  const updateMemory = () => {
    aOut.innerText = `A → ${a}`;
    dOut.innerText = `D → ${d}`;
    mOut.innerHTML = '';
    for (let i in m) {
      const row = document.createElement('tr');
      const index = document.createElement('td');
      index.innerText = i;
      const value = document.createElement('td');
      value.innerText = `${i == a ? '☛' : '→'} ${m[i]}`;
      row.append(index, value);
      mOut.appendChild(row);
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
