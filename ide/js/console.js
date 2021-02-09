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
const cin = async (message, location, classes) => {
  cout(message, location, classes);
  const value = await new Promise(resolve => {
    cinResolver = resolve;
  });
  cinResolver = null;
  return value;
};

iconsoleinput.addEventListener('keydown', ({ key, target }) => {
  if (key === 'Enter') {
    cout(target.value, 'Console');
    if (cinResolver) {
      cinResolver(parseInt(target.value));
    } else {
      if (currentMachine) currentMachine.execute(-1, target.value.toUpperCase());
    }
    target.value = '';
  }
});
