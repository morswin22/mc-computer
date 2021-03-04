const { showTooltip, hideTooltip, blurTooltip } = (() => {
  const refs = [];

  const getPosition = target => {
    const bbox = target.getBoundingClientRect();
    return {
      centerX: (bbox.left + bbox.right) / 2,
      bottomY: bbox.bottom,
    };
  };

  const resizeHandler = ref => {
    if (refs[ref] !== undefined) {
      const { target, main } = refs[ref];
      const { centerX, bottomY } = getPosition(target);
      const { width } = main.getBoundingClientRect();
      main.style.left = `${centerX - (width/2)}px`;
      main.style.top = `${bottomY}px`;
    }
  };

  const showTooltip = (target, elements) => {
    const main = document.createElement('div');
    main.classList.add('tooltip');
    const container = document.createElement('div');
    container.classList.add('tooltip-container');
    container.append(...elements);
    main.appendChild(container);
    document.body.appendChild(main);

    const ref = refs.push({main, target}) - 1;
    resizeHandler(ref);

    return ref;
  };

  const hideTooltip = ref => {
    refs[ref]?.main.remove();
    refs[ref] = undefined;
  };

  const blurTooltip = ref => setTimeout(() => hideTooltip(ref), 150);

  window.addEventListener('resize', () => refs.forEach((value, ref) => value && resizeHandler(ref)));

  return { showTooltip, hideTooltip, blurTooltip };
})();