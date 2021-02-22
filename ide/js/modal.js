const getModal = ({ open: openElement, close: closeElement, background: backgroundElement }, initial) => {
  let isOpen = !initial;

  const open = () => {
    isOpen = true;
    backgroundElement.classList.remove('close');
  };

  const close = () => {
    isOpen = false;
    backgroundElement.classList.add('close');
  };

  const set = state => state ? close() : open();
  const toggle = () => set(isOpen);

  set(isOpen);
  openElement.addEventListener('click', open);
  closeElement.addEventListener('click', close);
  backgroundElement.addEventListener('click', ({ target }) => {
    if (target === backgroundElement) close();
  });

  return { open, close, toggle, set };
};
