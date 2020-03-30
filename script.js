window.onload = function () {
    renderInitialState();
};

let lang = 'eng';
const ROWS_SIZE = [14, 29, 42, 55, 64];
const MULTI_CONTENT_KEYS = 12;
const LANG_CHANGED_KEYS = ['Alt', 'Shift'];
const replacedTextKeys = [['Delete', 'Del'], ['CapsLock', 'CapsLk'], ['Control', 'Ctrl'], ['Meta', 'Win'], ['ArrowUp', 'Up'], ['Backspace', 'Back'], ['ArrowDown', 'Down'], ['ArrowLeft', 'Left'], ['ArrowRight', 'Right']];

const lettersList = {
    rusKeys: [["ё", "Ё"], ["1", "!"], ["2", "\""], ["3", "№"], ["4", "; "], ["5", " % "], ["6", ":"], ["7", "?"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"], "Backspace", "Tab", "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ", "\\", "Delete", "CapsLock", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "Enter", "Shift", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".", "ArrowUp", "Shift", "Control", "Meta", "Alt", " ", "Alt", "ArrowLeft", "ArrowDown", "ArrowRight", "Control"],
    engKeys: [["`", "~"], ["1", "!"], ["2", "@"], ["3", "#"], ["4", "$"], ["5", "%"], ["6", "^"], ["7", "&"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"], "Backspace", "Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\", "Delete", "CapsLock", "a", "s", "d", "f", "g", "h", "j", "k", "l", "; ", "'", "Enter", "Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "ArrowUp", "Shift", "Control", "Meta", "Alt", " ", "Alt", "ArrowLeft", "ArrowDown", "ArrowRight", "Control"]
}

let templateElem = ``;
let textInput;
let isCapsOn = false;
let keyElementsList = [];
let capslockKey;
let pressedKeysList = [];
let keyboardElem;

function renderInitialState () {
    templateElem = document.createElement('DIV');
    templateElem.innerHTML = `<textarea class="text-content" rows="10" cols="45"></textarea>
        <div class="keyboard">
        <div class="row"></div>
        <div class="row"></div>
        <div class="row"></div>
        <div class="row"></div>
        <div class="row"></div>`

    fillWithLetters();
    textInput = templateElem.querySelector('.text-content');
    keyElementsList = templateElem.querySelectorAll('.key');
    capslockKey = templateElem.querySelector('.caps-key');
    keyboardElem = templateElem.querySelector('.keyboard');
    addHandlers();
    document.body.append(templateElem);
}

function fillWithLetters() {
    const rows = templateElem.querySelectorAll('.row');
    const lettersSet = lettersList[`${lang}Keys`];
    
    rows.forEach((row, index) => addKeysToRow(row, getSubarrayForRow(lettersSet, index)));
}

function addKeysToRow(row, lettersSet) {
    const rowKeysMurkup = lettersSet.map(letter => getMupkupFromLetter(letter)).join(``);
    row.innerHTML = rowKeysMurkup;
}

function getMupkupFromLetter(letter) {
    if (typeof letter == 'object') {
        return `<span class="key">${letter[0]}</span>`;
    }
    if (letter == ' ') {
        return `<span class="key extra-wide-key">${letter}</span>`;
    }
    if (letter == 'CapsLock') {
        return `<span class="key caps-key">${letter}</span>`;
    }
    if (letter.indexOf('Arrow') != -1) {
        return `<span class='key-wrap'>
            <span class="key hide-text">${letter}</span>
            <span class="replacing-text arrow-key arrow-${getReplacingText(letter).toLowerCase()}">${getReplacingText(letter)}</span>
            </span>`
    }
    if (getReplacingText(letter) !== false) {
        return `<span class='key-wrap'>
            <span class="key hide-text">${letter}</span>
            <span class="replacing-text">${getReplacingText(letter)}</span>
            </span>`
    }
    return `<span class="key">${letter}</span>`;
}

function getReplacingText(letter) {
    const replacedKeysArr = replacedTextKeys.flat();
    const positionInArray = replacedKeysArr.indexOf(letter);
    if (positionInArray != -1) {
        return replacedKeysArr[positionInArray + 1];
    }
    return false;
}

function getSubarrayForRow(lettersSet, rowIndex) {
    let subarrayStartPosition = 0;
    if (rowIndex > 0) {
        subarrayStartPosition = ROWS_SIZE[rowIndex - 1];
    }
    const subarrayEndPosition = ROWS_SIZE[rowIndex];

    return lettersSet.slice(subarrayStartPosition, subarrayEndPosition);
}

function addHandlers() {
    keyboardElem.addEventListener('mousedown', (evt) => {
        const targetKey = evt.target;

        if (!targetKey.classList.contains('key')) {
            return;
        }

        pressedKeysList.push(targetKey);

        targetKey.classList.add('active');

        let innerText = (evt.target.innerText === '') ? ' ' : evt.target.innerText;

        if (isRegularLetter(innerText)) {
            textTyping(innerText);
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
            case 'CapsLock':
                specialKeysHandlers.capslock();
                break;
            case 'Alt':
                specialKeysHandlers.onLangChange();
                break;  
        }
        textInput.focus();
    });

    keyboardElem.addEventListener('mouseup', mouseUpHandler);

    function mouseUpHandler(evt) {
        // if (pressedKeysList.length == 1) {
        //     pressedKeysList[0].classList.remove('active');
        //     pressedKeysList = [];
        //     // keyboardElem.removeEventListener('mouseup', mouseUpHandler);
        // } else {
            evt.target.classList.remove('active');
            textInput.focus();
            // pressedKeysList.splice(pressedKeysList.indexOf(evt.target), 1);
        // }
    }

    window.addEventListener('keydown', (evt) => {
        evt.preventDefault();
        const targetVirtualKeyIndex = findTargetVirtualKey(evt.key);
        const pressedKeyElement = keyElementsList[targetVirtualKeyIndex];
        if (!evt.repeat) {
            if (!(targetVirtualKeyIndex < 0)) {
                const myMousedown = new Event('mousedown', { bubbles: true, cancelable: false });
                pressedKeyElement.dispatchEvent(myMousedown);
            }
            // window.addEventListener('keyup', keyUpHandler);
        }
    });

    window.addEventListener('keyup', keyUpHandler);
    function keyUpHandler(evt) {
        const targetVirtualKeyIndex = findTargetVirtualKey(evt.key);
        const pressedKeyElement = keyElementsList[targetVirtualKeyIndex];
        const myMouseup = new Event('mouseup', { bubbles: true, cancelable: false });
        pressedKeyElement.dispatchEvent(myMouseup);
    }
}

function textTyping(innerText) {
    const cursorPosition = textInput.selectionStart;
    const textBeforeCursor = textInput.value.slice(0, cursorPosition);
    const textAfterCursor = textInput.value.slice(textInput.selectionEnd);
    textInput.value = textBeforeCursor + innerText + textAfterCursor;
    textInput.selectionStart = textInput.selectionEnd = cursorPosition + 1;
}

function isRegularLetter(innerText) {
    return innerText.length == 1
}

const specialKeysHandlers = {
    backspace() {
        if (textInput.value < 1) {
            return;
        }
        if (textInput.selectionStart != textInput.selectionEnd) {
            const cursorPosition = textInput.selectionStart;
            deleteSelectedDiapason();
            textInput.selectionStart = textInput.selectionEnd = cursorPosition;
            return;
        }
        // textInput.value = textInput.value.slice(0, -1);
        if (textInput.selectionEnd > 0) {
            const cursorPosition = textInput.selectionStart;
            textInput.value = textInput.value.slice(0, cursorPosition - 1) + textInput.value.slice(cursorPosition);
            textInput.selectionStart = textInput.selectionEnd = cursorPosition - 1;
        }
    },
    tab() {
        textInput.value += '\t';
    },
    enter() {
        textInput.value += '\n'; 
    },
    del() {
        if (textInput.selectionStart != textInput.selectionEnd) {
            deleteSelectedDiapason();
            return;
        }
        if (textInput.selectionEnd < textInput.value.length) {
            const cursorPosition = textInput.selectionStart;
            textInput.value = textInput.value.slice(0, cursorPosition) + textInput.value.slice(cursorPosition + 1);
            textInput.selectionStart = textInput.selectionEnd = cursorPosition;
        }
    },
    leftArrow() {
        const cursorPosition = textInput.selectionEnd;
        textInput.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
    },
    rightArrow() {
        const cursorPosition = textInput.selectionStart;
        if (cursorPosition < textInput.value.length) {
            textInput.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        }
    },
    capslock() {
        isCapsOn = !isCapsOn;
        capslockKey.classList.toggle('caps-active');
        keyElementsList.forEach((keyElem, index) => {
            if (isRegularLetter(keyElem.innerText)) {
                keyElem.innerText = isCapsOn ? keyElem.innerText.toUpperCase() : keyElem.innerText.toLowerCase();
            }
            if (isMultiContentKey(index)) {
                keyElem.innerText = isCapsOn ? lettersList[`${lang}Keys`][index][1] : lettersList[`${lang}Keys`][index][0];
            }
        });
    },
    onLangChange() {
        lang = (lang == 'eng') ? 'rus' : 'eng'

        keyElementsList.forEach((keyElem, index) => {
            const letter = lettersList[`${lang}Keys`][index];
            if (isMultiContentKey(index)) {
                keyElem.innerText = isCapsOn ? letter[1] : letter[0];
                return;
            }
            if (isRegularLetter(keyElem.innerText)) {
                keyElem.innerText = isCapsOn ? letter.toUpperCase() : letter.toLowerCase();
            }
        });
    }
}

function deleteSelectedDiapason() {
    textInput.value = textInput.value.slice(0, textInput.selectionStart) + textInput.value.slice(textInput.selectionEnd);
}

function isMultiContentKey(index) {
    if (index <= MULTI_CONTENT_KEYS) {
        return true;
    }
    return false;
}

function findTargetVirtualKey(pressedKey) {
    if (findMultiItem(pressedKey) !== false) {
        return findMultiItem(pressedKey);
    }

    if (findSimpleItem(pressedKey.toLowerCase()) !== false) {
        return findSimpleItem(pressedKey.toLowerCase())
    }

    return false;
}

function findMultiItem(pressedKey) {
    const multiRusKeysArray = lettersList.rusKeys.slice(0, MULTI_CONTENT_KEYS + 1);
    const indexInRus = getIndexInNestedArr(multiRusKeysArray, pressedKey);
    if (indexInRus !== false) {
        return indexInRus;
    }

    const multiEngKeysArray = lettersList.engKeys.slice(0, MULTI_CONTENT_KEYS + 1);
    const indexInEng = getIndexInNestedArr(multiEngKeysArray, pressedKey);
    if (indexInEng !== false) {
        return indexInEng;
    }

    return false;
}

function getIndexInNestedArr(nestedArr, pressedKey) {
    flatArr = nestedArr.flat();
    const indexInSubarr = flatArr.findIndex(letter => letter == pressedKey);
    if (indexInSubarr != -1) {
        indexInNestedArr = Math.floor(indexInSubarr / 2);
        return indexInNestedArr;
    }
    return false; 
}

function findSimpleItem(pressedKey) {
    let indexInRus = lettersList['rusKeys'].findIndex((letter, index) => {
        if (index <= MULTI_CONTENT_KEYS) {
            return;
        }
        return letter.toLowerCase() == pressedKey;
    })
    let indexInEng = lettersList['engKeys'].findIndex((letter, index) => {
        if (index <= MULTI_CONTENT_KEYS) {
            return;
        }
        return letter.toLowerCase() == pressedKey;
    });

    if (indexInRus != -1) {
        return indexInRus;
    }

    if (indexInEng != -1) {
        return indexInEng;
    }
    return false;
}