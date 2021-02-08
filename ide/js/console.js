const cclear = () => iconsole.innerHTML = '';

const cout = (message, location, classes = []) => {
  const container = document.createElement('div');
  for (const c of classes) container.classList.add(c);
  const messageSpan = document.createElement('span');
  messageSpan.innerText = message;
  const locationSpan = document.createElement('span');
  locationSpan.innerText = location;
  container.append(messageSpan, locationSpan);
  iconsole.appendChild(container);
};

const cerr = (message, location) => cout(message, location, ['error']);

let cinResolver = null;
const cin = callback => {
  new Promise(resolve => {
    cinResolver = resolve;
  }).then(value => {
    cinResolver = null;
    callback(value);
  });
};

iconsoleinput.addEventListener('keydown', ({ key, target }) => {
  if (key === 'Enter') {
    if (cinResolver) {
      cinResolver(target.value);
    } else {
      cout(target.value, 'Console');
      if (currentMachine) {
        currentMachine.execute(-1, target.value.toUpperCase());
        currentMachine.updateMemory();
      }
    }
    target.value = '';
  }
});
