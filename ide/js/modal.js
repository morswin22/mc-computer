const getModal = (element, initial) => {
  let isOpen = !initial;

  const open = () => {
    isOpen = true;
    element.classList.remove('close');
  };

  const close = () => {
    isOpen = false;
    element.classList.add('close');
  };

  const set = state => state ? close() : open();
  const toggle = () => set(isOpen);

  set(isOpen);

  return { open, close, toggle, set };
}

const modal = getModal(modalBackground, true);

modalOpen.addEventListener('click', modal.open);
modalBackground.addEventListener('click', ({ target }) => {
  if (target === modalBackground) modal.close();
});
modalClose.addEventListener('click', modal.close);