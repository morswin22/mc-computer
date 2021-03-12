const getTabs = (container, changeNameModal, removeModal, addModal) => {
  const content = [];
  let opened = null;
  let tooltipRef = null;
  const tooltipElements = (() => {
    const changeName = document.createElement('span');
    changeName.innerText = '🖉';
    changeName.addEventListener('click', () => changeNameModal.open());

    const remove = document.createElement('span');
    remove.innerText = '🗑';
    remove.addEventListener('click', () => removeModal.open());

    return [changeName, remove];
  })();

  const empty = () => {
    opened = null;
    content.splice(0, content.length);
    container.innerHTML = '';
  };
  const isEmpty = () => !content.length;

  const loadFromArray = array => {
    empty();
    for (const i in array) {
      content.push(array[i]);
      const element = document.createElement('div');
      element.setAttribute('tabindex', '0');
      element.innerText = array[i][0];
      element.addEventListener('click', ({ target }) => {
        if (target.classList.contains('open')) {
          hideTooltip(tooltipRef)
          tooltipRef = showTooltip(target, tooltipElements);
        } else {
          openTab(i);
        }
      });
      element.addEventListener('blur', () => blurTooltip(tooltipRef));
      container.appendChild(element);
    }
  }

  const loadFromLocalStorage = () => {
    const data = localStorage.getItem('mccomputer-tabs');
    if (data !== null) {
      const [lsOpened, lsContent] = JSON.parse(data);
      loadFromArray(lsContent);
      if (lsOpened !== null) openTab(lsOpened);
    }
  };

  const loadDefault = () => {
    loadFromArray([['Fibonacci', '@2\nM = 1\nM = D + M; out\nD = D + M; >; out']]);
    openTab(0);
  }

  const saveToLocalStorage = () => localStorage.setItem('mccomputer-tabs', JSON.stringify([opened, content]));

  const openTab = id => {
    updateStorage();
    container.querySelectorAll('.open').forEach(element => element.classList.remove('open'));
    opened = id;
    container.querySelector(`div:nth-of-type(${+id+1})`)?.classList.add('open');
    code.setValue(content[opened][1]);
  };

  const updateStorage = () => {
    if (opened !== null && content[opened] !== null) {
      content[opened][1] = code.getValue();
      saveToLocalStorage();
    }
  };

  const changeNameHandler = () => {
    const name = changeNameInput.value.trim();
    if (!name) return;
    changeNameInput.value = '';
    changeNameModal.close();
    if (opened !== null && content[opened] !== null) {
      content[opened][0] = name;
      container.querySelector(`div:nth-of-type(${+opened+1})`).innerText = name;
      updateStorage();
    }
  };

  const removeHandler = () => {
    removeModal.close();
    if (opened !== null && content[opened] !== null) {
      content.splice(opened, 1);
      container.querySelector(`div:nth-of-type(${+opened+1})`)?.remove();
      opened = null;
      if (isEmpty()) {
        loadDefault()
      } else {
        openTab(Math.min(opened, content.length - 1));
      }
      saveToLocalStorage();
    }
  };

  const addHandler = () => {
    const name = addInput.value.trim();
    if (!name) return;
    addInput.value = '';
    addTab.close();
    content.push([name, '']);
    saveToLocalStorage();
    loadFromArray([...content]);
  }

  window.addEventListener('beforeunload', updateStorage);
  setInterval(updateStorage, 2000);

  changeNameEnter.addEventListener('click', changeNameHandler);
  changeNameInput.addEventListener('keydown', ({ key }) => key === 'Enter' ? changeNameHandler() : null);

  removeEnter.addEventListener('click', removeHandler);

  container.addEventListener('click', ({ target }) => target === container ? addTab.open() : null);
  addEnter.addEventListener('click', addHandler);
  addInput.addEventListener('keydown', ({ key }) => key === 'Enter' ? addHandler() : null);

  loadFromLocalStorage();
  if (isEmpty()) loadDefault();

  return { loadDefault, loadFromArray, loadFromLocalStorage, saveToLocalStorage, isEmpty, openTab };
};
