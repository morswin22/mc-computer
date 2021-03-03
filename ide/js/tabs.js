const getTabs = container => {
  const content = [];
  let opened = null;

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
      element.addEventListener('click', () => openTab(i));
      container.appendChild(element);
    }
  }

  const loadFromLocalStorage = () => {
    const data = localStorage.getItem('mccomputer-tabs');
    if (data !== null) {
      const [lsOpened, lsContent] = JSON.parse(data);
      loadFromArray(lsContent);
      openTab(lsOpened);
    }
  };

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

  window.addEventListener('beforeunload', updateStorage);
  setInterval(updateStorage, 2000);

  loadFromLocalStorage();

  return { loadFromArray, loadFromLocalStorage, saveToLocalStorage, isEmpty, openTab };
};
