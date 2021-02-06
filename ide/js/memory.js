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
};
