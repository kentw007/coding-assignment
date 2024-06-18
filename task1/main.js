const BUTTON_MAP = {
  EDIT: 'edit-button',
  RESIZE: 'resize-button'
};

document.querySelector('.outer-frame').addEventListener('click', (event) => {
  const { classList } = event.target;

  if (classList.contains(BUTTON_MAP.EDIT)) {
    const textField = document.querySelector('.text-field');
    const isEditable = textField.contentEditable === 'true';

    textField.contentEditable = isEditable ? 'false' : 'true';
    event.target.textContent = isEditable ? 'edit' : 'done';
  } else if (classList.contains(BUTTON_MAP.RESIZE)) {
    const outerFrame = document.querySelector('.outer-frame');

    outerFrame.style.width =
      outerFrame.style.width === '400px' ? '800px' : '400px';
  }
});
