const getLowLevelMachine = () => {
  let a = 0, d = 0;
  const m = Array(2**4).fill(0);

  const whitespace = ' ,;'.split('');
  const removeWhitespace = line => line.split('').filter(char => whitespace.indexOf(char) === -1).join('');

  const dataRegex = /@(-?)(\d+)/;
  const operationRegex = /(([ADM]+)=)?([ADM&\|~01+\-]+|IN)?([!><]?=?)?(OUT|SWAP)?/;

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

  const execute = async (i, line) => {
    line = removeWhitespace(line);
    if (!line) return i + 1;
    if (dataRegex.test(line)) {
      const [, sign, number] = dataRegex.exec(line);
      const value = parseInt(`${sign}${number}`);
      a = value;
      updateMemory();
    } else if (operationRegex.test(line)) {
      const [,, destination, operation, jump, flag] = operationRegex.exec(line);
      let operationResult = undefined;
      if (operation) {
        if (operation === 'IN') {
          operationResult = await cin('Insert data', i == -1 ? '⮨' : `Line ${i}`); 
        } else {
          const X = d;
          const Y = (operation.indexOf('M') != -1) ? m[a] : a;

          const opcode = operation.replace('D', 'X').replace(/[AM]+/, 'Y');
          if (validOpcodes.indexOf(opcode) != -1) {
            eval(`operationResult = ${opcode}`);
          }
        }

        if (flag && flag === 'OUT') cout(operationResult, i == -1 ? '⮨' : `Line ${i}`);

        if (destination.indexOf('M') != -1) m[a] = operationResult;
        if (destination.indexOf('A') != -1) a = operationResult;
        if (destination.indexOf('D') != -1) d = operationResult;
      }
      updateMemory();
      if (jump && operationResult !== undefined && jumpRules[jump](operationResult)) {
        return a;
      }
    } else {
      console.error(`Unknown syntax: ${line}`);
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
