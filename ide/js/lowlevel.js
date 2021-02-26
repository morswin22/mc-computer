const getLowLevelMachine = () => {
  const bits = parseInt(compileBits.value);
  const size = 2 ** bits;
  const type = compileDataType.value;
  const rangeMin = type === 'int' ? -size/2 : type === 'uint' ? 0 : 0;
  const rangeMax = type === 'int' ? size/2 - 1 : type === 'uint' ? size - 1 : 0;

  let a = 0, d = 0;
  const m = Array(Math.min(Math.max(parseInt(compileMemorySize.value), 0), size)).fill(0);

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
    let errorOccured = false;
    if (dataRegex.test(line)) {
      const [, sign, number] = dataRegex.exec(line);
      const value = parseInt(`${sign}${number}`);
      a = value;
      updateMemory(a, d, [m, a]);
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

        if (operationResult > rangeMax) {
          operationResult = rangeMin + operationResult - rangeMax;
          cerr('Max data range exceeded', i == -1 ? '⮨' : `Line ${i}`);
          errorOccured = true;
        } else if (operationResult < rangeMin) {
          operationResult = rangeMax - operationResult + rangeMin;
          cerr('Min data range exceeded', i == -1 ? '⮨' : `Line ${i}`);
          errorOccured = true;
        }

        if (!errorOccured) {
          if (flag && flag === 'OUT') cout(operationResult, i == -1 ? '⮨' : `Line ${i}`);
  
          if (destination.indexOf('M') != -1) m[a] = operationResult;
          if (destination.indexOf('A') != -1) a = operationResult;
          if (destination.indexOf('D') != -1) d = operationResult;
        }
      }
      updateMemory(a, d, [m, a]);
      if (!errorOccured && jump && operationResult !== undefined && jumpRules[jump](operationResult)) {
        return a;
      }
    } else {
      console.error(`Unknown syntax: ${line}`);
    }
    return errorOccured ? false : i + 1;
  }

  const updateMemory = setupMemoryOutput(['A', 'D'], [['Memory', m.length]]);
  updateMemory(a, d, [m, a]);

  return { execute };
};
