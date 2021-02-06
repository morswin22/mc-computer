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
