class GuessesUI {
    public word = WordList.words[Math.randomRange(0, WordList.words.length - 1)];
    public greenLetters: string = '';
    public yellowLetters: string = '';
    public grayLetters: string = '';

    title = textsprite.create('InfiniWordle!');

    guessChars: TextSprite[] = [];
    guesses = 0;

    spacing = 8;
    rowLimit = 5;
    yOffset = 2.5 * 8;

    selected = 0;

    constructor() {
        this.title.left = screen.width / 2 - this.title.width / 2;
        this.title.top = this.title.height;

        for (let i = 1; i <= 6 * this.rowLimit; i++) {
            this.guessChars.push(textsprite.create('_'));
        }

        for (let i = 0; i < this.guessChars.length; i++) {
            this.guessChars[i].left = i % this.rowLimit * this.spacing + screen.width / 2 - this.rowLimit * this.spacing / 2;
            this.guessChars[i].top = Math.floor(i / this.rowLimit) * this.spacing + this.yOffset;
        }

        this.select(this.selected);

        console.log(this.word);
    }

    public putLetter(keyboard: Keyboard, letter: string) {
        if (keyboard.asking) {
            if (!this.checkWord()) return;

            this.select(this.selected + 1);

            this.assignLetterColors();

            keyboard.stopAsking();
            this.guesses++;

            return;
        }

        if (this.selected >= this.guessChars.length - 1) {
            keyboard.disabled = true;
            return;
        }

        if (this.guessChars[this.selected].text !== '_') {
            this.select(this.selected + 1);
        }
        this.guessChars[this.selected].setText(letter);

        if (this.selected % this.rowLimit === this.rowLimit - 1) {
            keyboard.ask();
        }
    }

    public del() {
        this.guessChars[this.selected].setText('_');
        if (this.selected > this.guesses * this.rowLimit) {
            this.select(this.selected - 1);
        }
    }

    select(num: number) {
        for (let i = this.guesses * this.rowLimit; i < (this.guesses + 1) * this.rowLimit; i++) {
            this.guessChars[i].fg = 1;
            this.guessChars[i].update();
        }

        if (num > this.guessChars.length - 1) return;

        this.guessChars[num].fg = 3;
        this.guessChars[num].update();

        this.selected = num;
    }

    checkWord() {
        let chosenWord = '';
        for (let i = this.guesses * this.rowLimit; i < (this.guesses + 1) * this.rowLimit; i++) {
            const letter = this.guessChars[i].text.toLowerCase();
            chosenWord = chosenWord + letter;
        }

        if (WordList.words.indexOf(chosenWord) === -1) {
            game.splash(`"${chosenWord}" is not a word`);
            return false;
        }

        if (chosenWord === this.word) {
            keyboard.disabled = true;
            setTimeout(() => {
                game.splash('Congrats!');
                game.splash(`The word was "${this.word}!"`);
                game.over(true);
            }, 250);
        } else if (this.selected >= this.guessChars.length - 1) {
            keyboard.disabled = true;
            setTimeout(() => {
                game.splash('You ran out of guesses!');
                game.splash(`The word was "${this.word}."`);
                game.over(false);
            }, 250);
        }

        return true;
    }

    assignLetterColors() {
        for (let i = this.guesses * this.rowLimit; i < (this.guesses + 1) * this.rowLimit; i++) {
            const char = this.guessChars[i];
            const letter = char.text.toLowerCase();

            if (this.word[i - this.guesses * this.rowLimit] === letter) {
                char.fg = 7;
                char.update();
                if (!this.greenLetters.includes(letter)) this.greenLetters = this.greenLetters + letter;
            } else if (this.word.includes(letter)) {
                char.fg = 5;
                char.update();
                if (!this.yellowLetters.includes(letter)) this.yellowLetters = this.yellowLetters + letter;
            } else {
                char.fg = 12;
                char.update();
                if (!this.grayLetters.includes(letter)) this.grayLetters = this.grayLetters + letter;
            }
        }
    }
}

class Keyboard {
    public disabled = false;
    ui: GuessesUI;
    _asking = false;

    spacing = 8;
    rowLimit = 9;
    yOffset = 10 * 8;

    keys = [
        [
            textsprite.create('Q'),
            textsprite.create('W'),
            textsprite.create('E'),
            textsprite.create('R'),
            textsprite.create('T'),
            textsprite.create('Y'),
            textsprite.create('U'),
            textsprite.create('I'),
            textsprite.create('O'),
            textsprite.create('P')
        ],
        [
            textsprite.create('A'),
            textsprite.create('S'),
            textsprite.create('D'),
            textsprite.create('F'),
            textsprite.create('G'),
            textsprite.create('H'),
            textsprite.create('J'),
            textsprite.create('K'),
            textsprite.create('L')
        ],
        [
            textsprite.create('Z'),
            textsprite.create('X'),
            textsprite.create('C'),
            textsprite.create('V'),
            textsprite.create('B'),
            textsprite.create('N'),
            textsprite.create('M')
        ]
    ];

    confirmText = textsprite.create('Confirm? (A/B)');

    selected = { column: 0, keyIndex: 0 };

    constructor(ui: GuessesUI) {
        this.ui = ui;

        for (let column = 0; column < this.keys.length; column++) {
            for (let keyIndex = 0; keyIndex < this.keys[column].length; keyIndex++) {
                const key = this.keys[column][keyIndex];

                key.left = screen.width / 2 + keyIndex * this.spacing - this.keys[column].length * this.spacing / 2;
                key.top = this.yOffset + column * this.spacing;
            }
        }
        this.select(this.selected);

        this.confirmText.left = screen.width / 2 - this.confirmText.width / 2;
        this.confirmText.top = this.yOffset + this.spacing;
        this.confirmText.scale = 0;
    }

    get asking() {
        return this._asking;
    }

    public up() {
        this.select({
            column: this.selected.column - 1,
            keyIndex: this.selected.keyIndex
        });
    }
    public down() {
        this.select({
            column: this.selected.column + 1,
            keyIndex: this.selected.keyIndex
        });
    }
    public left() {
        this.select({
            column: this.selected.column,
            keyIndex: mod(this.selected.keyIndex - 1, this.keys[this.selected.column].length)
        });
    }
    public right() {
        this.select({
            column: this.selected.column,
            keyIndex: mod(this.selected.keyIndex + 1, this.keys[this.selected.column].length)
        });
    }

    public putLetter() {
        if (this.disabled) return;
        this.ui.putLetter(this, this.keys[this.selected.column][this.selected.keyIndex].text);

        for (let i = 0; i < ui.grayLetters.length; i++) {
            const letter = ui.grayLetters[i];
        }
    }

    public del() {
        if (this.disabled) return;
        this.ui.del();
        if (this._asking) {
            this.stopAsking();
        }
    }

    public ask() {
        this.keys.forEach(column => {
            column.forEach(key => {
                key.scale = 0;
            });
        });
        this.confirmText.scale = 1;
        this._asking = true;
    }

    public stopAsking() {
        this._asking = false;
        this.keys.forEach(column => {
            column.forEach(key => {
                key.scale = 1;
            });
        });
        this.confirmText.scale = 0;
        this.select(this.selected);
    }

    select(coord: { column: number, keyIndex: number }) {
        if (this._asking) return;

        const column = Math.constrain(coord.column, 0, this.keys.length - 1);
        const keyIndex = Math.constrain(coord.keyIndex, 0, this.keys[column].length - 1);

        this.updateKeyColors();
        this.keys[column][keyIndex].fg = 3;
        this.keys[column][keyIndex].update();

        this.selected = { column: column, keyIndex: keyIndex };
    }

    updateKeyColors() {
        this.keys.forEach(column => {
            column.forEach(key => {
                key.bg = 0;
                if (ui.greenLetters.includes(key.text.toLowerCase())) {
                    key.fg = 7;
                } else if (ui.yellowLetters.includes(key.text.toLowerCase())) {
                    key.fg = 5;
                } else if (ui.grayLetters.includes(key.text.toLowerCase())) {
                    key.fg = 12;
                } else {
                    key.fg = 1;
                }
                key.update();
            });
        });
    }
}

let ui = new GuessesUI();
let keyboard = new Keyboard(ui);

controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
    keyboard.up();
});
controller.up.onEvent(ControllerButtonEvent.Repeated, () => {
    keyboard.up();
});
controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
    keyboard.down();
});
controller.down.onEvent(ControllerButtonEvent.Repeated, () => {
    keyboard.down();
});
controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
    keyboard.left();
});
controller.left.onEvent(ControllerButtonEvent.Repeated, () => {
    keyboard.left();
});
controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
    keyboard.right();
});
controller.right.onEvent(ControllerButtonEvent.Repeated, () => {
    keyboard.right();
});
controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    keyboard.putLetter();
});
controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
    keyboard.del();
});

controller.setRepeatDefault(250, 100)

function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}