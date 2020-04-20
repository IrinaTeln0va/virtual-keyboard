let isStorageSupport = true;
let storageValue;
let timer;

const REGULAR_LETTER_LENGTH = 1;
const CURSOR_STEP = 1;
const BEFORE_SHIFT_DELAY = 150;
const AMOUNT_OF_LETTER_REPEATING = 2;

function getLangFromStorage() {
  try {
    storageValue = localStorage.getItem('lang');
  } catch (err) {
    isStorageSupport = false;
  }
}

getLangFromStorage();

let lang = storageValue || 'eng';
const ROWS_SIZE = [14, 29, 42, 55, 64];
const MULTI_CONTENT_KEYS = 12;
const LANG_CHANGING_KEYS = [['Alt', 'Shift'], ['AltGraph', 'Shift']];
const replacedTextKeys = [['Delete', 'Del'], ['CapsLock', 'CapsLk'], ['Control', 'Ctrl'], ['Meta', 'Win'], ['ArrowUp', 'Up'], ['Backspace', 'Back'], ['AltGraph', 'Alt'], ['ArrowDown', 'Down'], ['ArrowLeft', 'Left'], ['ArrowRight', 'Right']];
const doubledKeysList = ['Alt', 'AltGraph', 'Control', 'Shift'];

const lettersList = {
  rusKeys: [['ё', 'Ё'], ['1', '!'], ['2', '"'], ['3', '№'], ['4', '; '], ['5', ' % '], ['6', ':'], ['7', '?'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+'], 'Backspace', 'Tab', 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', '\\', 'Delete', 'CapsLock', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'Enter', 'Shift', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.', 'ArrowUp', 'Shift', 'Control', 'Meta', 'Alt', ' ', 'AltGraph', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Control'],
  engKeys: [['`', '~'], ['1', '!'], ['2', '@'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+'], 'Backspace', 'Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', 'Delete', 'CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '; ', "'", 'Enter', 'Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ArrowUp', 'Shift', 'Control', 'Meta', 'Alt', ' ', 'Alt', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Control'],
};

let templateElem = '';
let textInput;
let isCapsOn = false;
let keyElementsList = [];
let capslockKey;
let pressedKeysList = [];
let keyboardElem;

function getReplacingText(letter) {
  const positionInArray = replacedTextKeys.findIndex(([replacedKeyItem]) => {
    if (replacedKeyItem === letter) {
      return true;
    }

    return false;
  });

  if (positionInArray !== -1) {
    const replacingPair = replacedTextKeys[positionInArray];
    const [, replacedLetter] = replacingPair;

    return replacedLetter;
  }

  return false;
}

function getMupkupFromLetter(letter) {
  if (typeof letter === 'object') {
    const [capsOffLetter] = letter;

    return `<span class="key">${[capsOffLetter]}</span>`;
  }

  if (letter === ' ') {
    return `<span class="key extra-wide-key">${letter}</span>`;
  }

  if (letter === 'CapsLock') {
    return `<span class="key caps-key">${letter}</span>`;
  }

  if (letter.indexOf('Arrow') !== -1) {
    return `<span class='key-wrap'>
            <span class="key hide-text">${letter}</span>
            <span class="replacing-text arrow-key arrow-${getReplacingText(letter).toLowerCase()}">${getReplacingText(letter)}</span>
            </span>`;
  }

  if (getReplacingText(letter)) {
    return `<span class='key-wrap'>
            <span class="key hide-text">${letter}</span>
            <span class="replacing-text">${getReplacingText(letter)}</span>
            </span>`;
  }

  return `<span class="key">${letter}</span>`;
}

function addKeysToRow(row, lettersSet) {
  const rowElem = row;
  const rowKeysMurkup = lettersSet.map((letter) => getMupkupFromLetter(letter)).join('');

  rowElem.innerHTML = rowKeysMurkup;
}

function getSubarrayForRow(lettersSet, rowIndex) {
  let subarrayStartPosition = 0;

  if (rowIndex > 0) {
    subarrayStartPosition = ROWS_SIZE[rowIndex - 1];
  }

  const subarrayEndPosition = ROWS_SIZE[rowIndex];

  return lettersSet.slice(subarrayStartPosition, subarrayEndPosition);
}

function fillWithLetters() {
  const rows = templateElem.querySelectorAll('.row');
  const lettersSet = lettersList[`${lang}Keys`];

  rows.forEach((row, index) => addKeysToRow(row, getSubarrayForRow(lettersSet, index)));
}

function isRegularLetter(innerText) {
  return innerText.length === REGULAR_LETTER_LENGTH;
}

function textTyping(innerText) {
  const cursorPosition = textInput.selectionStart;
  const textBeforeCursor = textInput.value.slice(0, cursorPosition);
  const textAfterCursor = textInput.value.slice(textInput.selectionEnd);

  textInput.value = textBeforeCursor + innerText + textAfterCursor;
  textInput.selectionStart = cursorPosition + CURSOR_STEP;
  textInput.selectionEnd = cursorPosition + CURSOR_STEP;
}

function isLangChangingPressed(pressedKeysArray) {
  const pressedCodeList = pressedKeysArray.map((key) => key.innerText);

  return LANG_CHANGING_KEYS[0].every((key) => pressedCodeList.indexOf(key) !== -1)
  || LANG_CHANGING_KEYS[1].every((key) => pressedCodeList.indexOf(key) !== -1);
}

function deleteSelectedDiapason() {
  textInput.value = textInput.value.slice(0, textInput.selectionStart)
  + textInput.value.slice(textInput.selectionEnd);
}

function isMultiContentKey(index) {
  return index <= MULTI_CONTENT_KEYS;
}

const specialKeysHandlers = {
  backspace() {
    if (textInput.value.length < 1) {
      return;
    }

    if (textInput.selectionStart !== textInput.selectionEnd) {
      const cursorPosition = textInput.selectionStart;

      deleteSelectedDiapason();
      textInput.selectionStart = cursorPosition;
      textInput.selectionEnd = cursorPosition;
      return;
    }

    if (textInput.selectionEnd > 0) {
      const cursorPosition = textInput.selectionStart;

      textInput.value = textInput.value.slice(0, cursorPosition - CURSOR_STEP)
      + textInput.value.slice(cursorPosition);
      textInput.selectionStart = cursorPosition - CURSOR_STEP;
      textInput.selectionEnd = cursorPosition - CURSOR_STEP;
    }
  },

  tab() {
    textTyping('\t');
  },

  enter() {
    textInput.value += '\n';
  },

  del() {
    if (textInput.selectionStart !== textInput.selectionEnd) {
      const cursorPosition = textInput.selectionStart;

      deleteSelectedDiapason();
      textInput.selectionStart = cursorPosition;
      textInput.selectionEnd = cursorPosition;
      return;
    }

    const isLessThanSelectionEnd = textInput.selectionEnd <= textInput && textInput.value && textInput.value.length;

    if (isLessThanSelectionEnd) {
      const cursorPosition = textInput.selectionStart;

      textInput.value = textInput.value.slice(0, cursorPosition)
      + textInput.value.slice(cursorPosition + CURSOR_STEP);
      textInput.selectionStart = cursorPosition;
      textInput.selectionEnd = cursorPosition;
    }
  },

  leftArrow() {
    const cursorPosition = textInput.selectionEnd;

    if (cursorPosition === 0) {
      return;
    }

    textInput.setSelectionRange(cursorPosition - CURSOR_STEP, cursorPosition - CURSOR_STEP);
  },

  rightArrow() {
    const cursorPosition = textInput.selectionStart;

    if (cursorPosition < textInput.value.length) {
      textInput.setSelectionRange(cursorPosition + CURSOR_STEP, cursorPosition + CURSOR_STEP);
    }
  },

  capslock(evt) {
    if (evt.detail.repeated) {
      return;
    }

    isCapsOn = !isCapsOn;
    capslockKey.classList.toggle('caps-active');
    keyElementsList.forEach((elem, index) => {
      const keyElem = elem;

      if (isRegularLetter(keyElem.innerText)) {
        keyElem.innerText = isCapsOn
          ? keyElem.innerText.toUpperCase()
          : keyElem.innerText.toLowerCase();
      }

      if (isMultiContentKey(index)) {
        keyElem.innerText = isCapsOn ? lettersList[`${lang}Keys`][index][1] : lettersList[`${lang}Keys`][index][0];
      }
    });
  },

  onShiftUppercase(evt) {
    if (evt.type === 'mousedown' && !evt.detail.repeated) {
      keyElementsList.forEach((elem) => {
        const keyElem = elem;

        if (isRegularLetter(keyElem.innerText)) {
          keyElem.innerText = keyElem.innerText.toUpperCase();
        }
      });
    }
  },

  onShiftLowercase() {
    if (isCapsOn) {
      return;
    }

    keyElementsList.forEach((elem) => {
      const keyElem = elem;

      if (isRegularLetter(keyElem.innerText)) {
        keyElem.innerText = keyElem.innerText.toLowerCase();
      }
    });
  },

  onLangChange() {
    clearTimeout(timer);
    specialKeysHandlers.onShiftLowercase();

    lang = (lang === 'eng') ? 'rus' : 'eng';

    if (isStorageSupport) {
      localStorage.setItem('lang', lang);
    }

    keyElementsList.forEach((elem, index) => {
      const keyElem = elem;
      const letter = lettersList[`${lang}Keys`][index];

      if (isMultiContentKey(index)) {
        keyElem.innerText = isCapsOn ? letter[1] : letter[0];
        return;
      }

      if (isRegularLetter(keyElem.innerText)) {
        keyElem.innerText = isCapsOn ? letter.toUpperCase() : letter.toLowerCase();
      }
    });
  },
};

function addHandlers() {
  keyboardElem.addEventListener('mousedown', (evt) => {
    const { target: targetKey } = evt;

    if (!targetKey.classList.contains('key')) {
      return;
    }

    if (!evt.detail.repeated) {
      pressedKeysList.push(targetKey);
      targetKey.classList.add('active');
    }

    const innerText = (targetKey.innerText === '') ? ' ' : targetKey.innerText;

    if (isRegularLetter(innerText)) {
      textTyping(innerText);
    }

    const moreThanOneKeysPressed = pressedKeysList.length > 1;
    const isRepeatedEvent = evt.detail.repeated;

    if (moreThanOneKeysPressed
      && isLangChangingPressed(pressedKeysList)
      && !isRepeatedEvent) {
      specialKeysHandlers.onLangChange();
    }

    switch (innerText) {
      case 'Backspace':
        specialKeysHandlers.backspace();
        break;
      case 'Delete':
        specialKeysHandlers.del();
        break;
      case 'Tab':
        specialKeysHandlers.tab();
        break;
      case 'Enter':
        specialKeysHandlers.enter();
        break;
      case 'ArrowLeft':
        specialKeysHandlers.leftArrow();
        break;
      case 'ArrowRight':
        specialKeysHandlers.rightArrow();
        break;
      case 'ArrowUp':
        textTyping('↑');
        break;
      case 'ArrowDown':
        textTyping('↓');
        break;
      case 'CapsLock':
        specialKeysHandlers.capslock(evt);
        break;
      case 'Shift':
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          specialKeysHandlers.onShiftUppercase(evt);
        }, BEFORE_SHIFT_DELAY);
        break;
      default:
        textInput.focus();
        return;
    }
    textInput.focus();
  });

  function resetKeyboardState() {
    keyElementsList.forEach((key) => key.classList.remove('active'));
    pressedKeysList = [];
  }

  function upTargetKey(key) {
    const keyIndex = pressedKeysList.indexOf(key);

    if (keyIndex === -1) {
      pressedKeysList[pressedKeysList.length - 1].classList.remove('active');
      pressedKeysList.pop();
    }

    pressedKeysList[keyIndex].classList.remove('active');
    pressedKeysList.splice(keyIndex, 1);
  }

  function mouseUpHandler({ target }) {
    if (target.innerText === 'Shift') {
      clearTimeout(timer);
      specialKeysHandlers.onShiftLowercase();
    }

    if (pressedKeysList.length <= 1) {
      resetKeyboardState();
      textInput.focus();
      return;
    }

    upTargetKey(target);
    textInput.focus();
  }

  function findIndexInSubarray(array, pressedKey) {
    const indexInArray = array.findIndex((letter, index) => {
      if (index <= MULTI_CONTENT_KEYS) {
        return false;
      }

      return letter.toLowerCase() === pressedKey;
    });

    return indexInArray;
  }

  function findIfDoubledItem(pressedKey, pressedKeyCode) {
    const array = lettersList.engKeys;

    if (doubledKeysList.indexOf(pressedKey) === -1) {
      return false;
    }

    if (pressedKeyCode.endsWith('Left')) {
      findIndexInSubarray(lettersList.engKeys, pressedKey);
    }

    if (pressedKeyCode.endsWith('Right')) {
      let orderInPair = 0;
      const indexInArray = array.findIndex((letter, index) => {
        if (index <= MULTI_CONTENT_KEYS) {
          return false;
        }

        if (letter === pressedKey) {
          orderInPair += 1;
        }

        return orderInPair === AMOUNT_OF_LETTER_REPEATING;
      });

      return (indexInArray !== -1) ? indexInArray : false;
    }

    return false;
  }

  function getIndexInNestedArr(nestedArr, pressedKey) {
    const flatArr = nestedArr.flat();
    const indexInSubarr = flatArr.findIndex((letter) => letter === pressedKey);

    if (indexInSubarr !== -1) {
      const indexInNestedArr = Math.floor(indexInSubarr / 2);

      return indexInNestedArr;
    }

    return 'isNotFound';
  }

  function findIfMultiItem(pressedKey) {
    const multiRusKeysArray = lettersList.rusKeys.slice(0, MULTI_CONTENT_KEYS + 1);
    const indexInRus = getIndexInNestedArr(multiRusKeysArray, pressedKey);

    if (indexInRus !== 'isNotFound') {
      return indexInRus;
    }

    const multiEngKeysArray = lettersList.engKeys.slice(0, MULTI_CONTENT_KEYS + 1);
    const indexInEng = getIndexInNestedArr(multiEngKeysArray, pressedKey);

    if (indexInEng !== 'isNotFound') {
      return indexInEng;
    }

    return false;
  }

  function findSimpleItem(pressedKey) {
    const indexInRus = findIndexInSubarray(lettersList.rusKeys, pressedKey);
    const indexInEng = findIndexInSubarray(lettersList.engKeys, pressedKey);

    if (indexInRus !== -1) {
      return indexInRus;
    }

    if (indexInEng !== -1) {
      return indexInEng;
    }

    return false;
  }

  function findTargetVirtualKey(pressedKey, pressedKeyCode) {
    if (findIfDoubledItem(pressedKey, pressedKeyCode) !== false) {
      return findIfDoubledItem(pressedKey, pressedKeyCode);
    }

    if (findIfMultiItem(pressedKey) !== false) {
      return findIfMultiItem(pressedKey);
    }

    if (findSimpleItem(pressedKey.toLowerCase()) !== false) {
      return findSimpleItem(pressedKey.toLowerCase());
    }

    return false;
  }

  window.addEventListener('mouseup', mouseUpHandler);

  window.addEventListener('keydown', (evt) => {
    evt.preventDefault();
    const { key, code } = evt;
    const targetVirtualKeyIndex = findTargetVirtualKey(key, code);
    const pressedKeyElement = keyElementsList[targetVirtualKeyIndex];

    if (!(targetVirtualKeyIndex < 0) && (targetVirtualKeyIndex !== false)) {
      const myMousedown = new CustomEvent('mousedown', { detail: { repeated: evt.repeat }, bubbles: true, cancelable: false });

      pressedKeyElement.dispatchEvent(myMousedown);
    }
  });

  function keyUpHandler(evt) {
    evt.preventDefault();
    const { key, code } = evt;
    const targetVirtualKeyIndex = findTargetVirtualKey(key, code);

    if (targetVirtualKeyIndex === false) {
      return;
    }

    const pressedKeyElement = keyElementsList[targetVirtualKeyIndex];
    const myMouseup = new Event('mouseup', { bubbles: true, cancelable: false });

    pressedKeyElement.dispatchEvent(myMouseup);
  }

  window.addEventListener('keyup', keyUpHandler);

  window.onblur = resetKeyboardState;
}

function renderInitialState() {
  templateElem = document.createElement('DIV');
  templateElem.innerHTML = `<textarea class="text-content" rows="10" cols="45"></textarea>
        <div class="keyboard">
        <div class="row"></div>
        <div class="row"></div>
        <div class="row"></div>
        <div class="row"></div>
        <div class="row"></div>
        <div class="tip-message">To switch the keyboard to <br>another language press <br><span class="key-comb">Shift+Alt</span></div>
        <div class="os-info">Created on Windows OS</div>
        </div>`;

  fillWithLetters();
  textInput = templateElem.querySelector('.text-content');
  keyElementsList = templateElem.querySelectorAll('.key');
  capslockKey = templateElem.querySelector('.caps-key');
  keyboardElem = templateElem.querySelector('.keyboard');
  addHandlers();
  document.body.append(templateElem);
}

window.onload = function onload() {
  renderInitialState();
};
