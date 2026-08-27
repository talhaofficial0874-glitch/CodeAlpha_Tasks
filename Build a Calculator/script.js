class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.readyToReset = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') this.clear();
        if (this.readyToReset && number !== '.') {
            this.currentOperand = number.toString();
            this.readyToReset = false;
            return;
        }
        if (this.readyToReset && number === '.') {
            this.currentOperand = '0.';
            this.readyToReset = false;
            return;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') this.clear();
        if (this.currentOperand === '') return;
        
        // If we are overriding an operation
        if (this.previousOperand !== '' && this.currentOperand === '0' && this.readyToReset) {
            this.operation = operation;
            return;
        }
        
        if (this.previousOperand !== '') {
            this.compute(false);
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0'; // Keep display as 0 but hide it mentally or just wait for next input
        this.readyToReset = true;
    }

    compute(animate = true) {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−': // U+2212
            case '-': // U+002D
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.readyToReset = true;
                    this.triggerPulse();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Avoid floating point precision issues
        computation = Math.round(computation * 100000000) / 100000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.readyToReset = true;
        
        if (animate) this.triggerPulse();
    }
    
    computePercentage() {
        if (this.currentOperand === 'Error') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
        this.triggerPulse();
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        if (number === '-' || number === '') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.readyToReset && this.operation != null && this.currentOperand === '0') {
            // When operator is pressed, keep showing previous operand as current result 
            // until new numbers are typed
            this.currentOperandTextElement.innerText = this.getDisplayNumber(this.previousOperand);
        } else {
            this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        }
        
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
    
    triggerPulse() {
        this.currentOperandTextElement.classList.remove('pulse');
        void this.currentOperandTextElement.offsetWidth; // trigger reflow
        this.currentOperandTextElement.classList.add('pulse');
    }
}

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('.btn-operator');
const equalsButton = document.querySelector('.btn-equals');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const percentageButton = document.querySelector('[data-action="percentage"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);
calculator.updateDisplay();

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Map UI signs to internal operators if needed, or just use UI signs
        calculator.chooseOperation(button.innerText.trim());
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

clearButton.addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

percentageButton.addEventListener('click', () => {
    calculator.computePercentage();
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= 0 && e.key <= 9 || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '*' || e.key === 'x') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    }
    if (e.key === '/') {
        e.preventDefault();
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }
    if (e.key === '%') {
        calculator.computePercentage();
        calculator.updateDisplay();
    }
});
