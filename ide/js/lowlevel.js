const getLowLevelMachine = () => {
  const bits = parseInt(compileBits.value);
  const size = 2 ** bits;
  const type = compileDataType.value;
  const rangeMin = type === 'int' ? -size/2 : type === 'uint' ? 0 : 0;
  const rangeMax = type === 'int' ? size/2 - 1 : type === 'uint' ? size - 1 : 0;
  const zeros = Array(bits).fill(0).join('');
  const instructionZeros = Array(16).fill(0).join('');

  let a = 0, d = 0;
  const m = Array(Math.min(Math.max(parseInt(compileMemorySize.value), 0), size)).fill(0);

  const whitespace = ' ,;'.split('');
  const removeWhitespace = line => line.split('').filter(char => whitespace.indexOf(char) === -1).join('');

  const dataRegex = /@(-?)(\d+)/;
  const operationRegex = /(([ADM]+)=)?([ADM&\|~01+\-]+|IN)?([!><]?=?)?(OUT|SWAP)?/;

  const jumpRules = {
    "!": () => true,
    "!=": value => value != 0,
    "<=": value => value <= 0,
    ">=": value => value >= 0,
    "=": value => value == 0,
    ">": value => value > 0,
    "<": value => value < 0,
  };

  const validOpcodes = ["X", "Y", "X&Y", "X|Y", "~X", "~Y", "X+Y", "X-Y", "Y-X", "0", "-1", "1", "-X", "-Y", "X+1", "Y+1", "X-1", "Y-1"];
  
  const jumpCompilations = {"!": '111', "!=": '101', "<=": '110', ">=": '011', "=": '010', ">": '001', "<": '100'};
  const opcodeCompilations = {"X": '001010', "Y": '100010', "X&Y": '000000', "X|Y": '010101', "~X": '011010', "~Y": '100110', "X+Y": '000010', "X-Y": '010011', "Y-X": '000111', "0": '101000', "-1": '100101', "1": '111111', "-X": '001111', "-Y": '110011', "X+1": '011111', "Y+1": '110111', "X-1": '001110', "Y-1": '110010'};

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

  const parseNegative = value => (parseInt(withLeftPadding(-value).split('').map(bit => bit === '0' ? '1' : '0').join(''), 2) + 1).toString(2).slice(-bits);

  const withLeftPadding = (value, z = zeros) => (z + value.toString(2)).slice(-z.length);

  const compile = (lines) => {
    const output = [];
    lines = lines.map(removeWhitespace).filter(line => line);
    for (const line of lines) {
      if (dataRegex.test(line)) {
        const [, sign, number] = dataRegex.exec(line);
        const value = parseInt(`${sign}${number}`);
        if (value < rangeMin || value > rangeMax) return 'Compilation error.';
        const parsedValue = value > 0 ? withLeftPadding(value) : parseNegative(value);
        output.push(withLeftPadding(parsedValue, instructionZeros));
      } else if (operationRegex.test(line)) {
        const [,, destination, operation, jump, flag] = operationRegex.exec(line);
        let result = '1';
        if (operation) {
          result += operation === 'IN' || flag === 'SWAP' ? '1' : '0';
          result += flag === 'OUT' || flag === 'SWAP' ? '1' : '0';
          result += operation.indexOf('M') != -1 ? '1' : '0';
          if (operation !== 'IN') {
            const opcode = operation.replace('D', 'X').replace(/[AM]+/, 'Y');
            if (validOpcodes.indexOf(opcode) != -1) {
              result += opcodeCompilations[opcode];
            } else {
              console.error(`Unknown opcode: ${opcode} at ${line}`);
            }
          } else {
            result += '000000';
          }
          result += destination.indexOf('M') != -1 ? '1' : '0';
          result += destination.indexOf('A') != -1 ? '1' : '0';
          result += destination.indexOf('D') != -1 ? '1' : '0';
        }
        if (jump) {
          result += jumpCompilations[jump];
        } else {
          result += '000';
        }
        output.push(result);
      } else {
        console.error(`Unknown syntax: ${line}`);
      }
    }
    return output.join('\n');
  };

  const updateMemory = setupMemoryOutput(['A', 'D'], [['Memory', m.length]]);
  updateMemory(a, d, [m, a]);

  return { execute, compile };
};
