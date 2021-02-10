const makeTable = (name, list, wrap = 4) => {
  const table = document.createElement('div');
  table.classList.add('table');
  const outputs = [];
  const highlights = [];

  const heading = document.createElement('div');
  heading.classList.add('heading');
  heading.innerText = name;
  heading.colSpan = `${wrap}`;
  table.appendChild(heading);
  
  for (let i = 0; i < list.length; i += wrap) {
    const rowNames = document.createElement('div');
    rowNames.classList.add('row');
    for (let j = i; j < list.length && j < i+wrap; j++) {
      const column = document.createElement('div');
      column.classList.add('column');
      column.innerText = list[j];
      highlights.push(column);
      rowNames.appendChild(column);
    }
    const rowValues = document.createElement('div');
    rowValues.classList.add('row');
    for (let j = i; j < list.length && j < i+wrap; j++) {
      const column = document.createElement('div');
      column.classList.add('column');
      column.innerText = 0;
      outputs.push(column);
      rowValues.appendChild(column);
    }
    table.append(rowNames, rowValues);
  }

  return { outputs, table, highlights };
}

const setupMemoryOutput = (scalars, vectors) => {
  const generated = [];
  generated.push(makeTable('Registers', scalars));
  generated.push(...vectors.map(([ name, length ]) => makeTable(name, Array(length).fill(0).map((i,j)=>j))));
  
  memory.innerHTML = '';
  memory.append(...generated.map(({ table }) => table));

  return function() {
    for (let i = 0; i < scalars.length; i++) {
      generated[0].outputs[i].innerText = arguments[i];
    }
    for (let i = 0; i < vectors.length; i++) {
      generated[i+1].table.querySelector('.selected')?.classList.remove('selected');
      generated[i+1].highlights[arguments[i+scalars.length][1]].classList.add('selected');
      for (let j = 0; j < arguments[i+scalars.length][0].length; j++) {
        generated[i+1].outputs[j].innerText = arguments[i+scalars.length][0][j];
      }
    }
  };
};
