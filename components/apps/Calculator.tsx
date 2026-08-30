'use client'

import React, { useState, useEffect, useCallback } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [memory, setMemory] = useState<number>(0)
  const [hasMemory, setHasMemory] = useState(false)

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }, [display, waitingForOperand])

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }, [display, waitingForOperand])

  const clearAll = useCallback(() => {
    setDisplay('0')
    setPrevValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }, [])

  const clearEntry = useCallback(() => {
    setDisplay('0')
  }, [])

  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }, [display])

  const performOperation = useCallback((nextOp: string) => {
    const inputValue = parseFloat(display)

    if (prevValue === null) {
      setPrevValue(inputValue)
    } else if (operation) {
      const current = prevValue || 0
      let newValue = current

      switch (operation) {
        case '+':
          newValue = current + inputValue
          break
        case '-':
          newValue = current - inputValue
          break
        case '×':
        case '*':
          newValue = current * inputValue
          break
        case '÷':
        case '/':
          newValue = inputValue !== 0 ? current / inputValue : 0
          break
        default:
          break
      }

      setPrevValue(newValue)
      setDisplay(String(newValue).slice(0, 14))
    }

    setWaitingForOperand(true)
    setOperation(nextOp === '=' ? null : nextOp)
  }, [display, operation, prevValue])

  // Single operand operations
  const invertSign = () => {
    const val = parseFloat(display)
    setDisplay(String(-val))
  }

  const squareRoot = () => {
    const val = parseFloat(display)
    if (val >= 0) {
      setDisplay(String(Math.sqrt(val)).slice(0, 14))
      setWaitingForOperand(true)
    }
  }

  const percentage = () => {
    const val = parseFloat(display)
    setDisplay(String(val / 100))
    setWaitingForOperand(true)
  }

  const reciprocal = () => {
    const val = parseFloat(display)
    if (val !== 0) {
      setDisplay(String(1 / val).slice(0, 14))
      setWaitingForOperand(true)
    }
  }

  // Memory keys
  const memClear = () => {
    setMemory(0)
    setHasMemory(false)
  }
  const memRecall = () => {
    setDisplay(String(memory))
    setWaitingForOperand(true)
  }
  const memStore = () => {
    setMemory(parseFloat(display))
    setHasMemory(true)
    setWaitingForOperand(true)
  }
  const memAdd = () => {
    setMemory(memory + parseFloat(display))
    setHasMemory(true)
    setWaitingForOperand(true)
  }

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key)
      } else if (e.key === '.') {
        inputDecimal()
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        performOperation(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key)
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        performOperation('=')
      } else if (e.key === 'Escape') {
        clearAll()
      } else if (e.key === 'Backspace') {
        backspace()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputDigit, inputDecimal, performOperation, clearAll, backspace])

  return (
    <div className="calc-frame os-chrome">
      <div className="window-menubar">
        <div className="window-menubar-item" onClick={() => navigator.clipboard.writeText(display)}>
          Edit
        </div>
        <div className="window-menubar-item">View</div>
        <div className="window-menubar-item">Help</div>
      </div>

      {/* Calculator LCD Screen */}
      <div className="calc-display-box">
        {hasMemory && (
          <span style={{ fontSize: 10, marginRight: 'auto', color: '#000080', fontWeight: 'bold' }}>
            M
          </span>
        )}
        <span>{display}</span>
      </div>

      {/* Keypad Grid */}
      <div className="calc-grid">
        {/* Row 1 */}
        <button className="calc-key" onClick={backspace} title="Backspace">
          ←
        </button>
        <button className="calc-key btn-danger" onClick={clearEntry} title="Clear Entry">
          CE
        </button>
        <button className="calc-key btn-danger" onClick={clearAll} title="Clear All">
          C
        </button>
        <button className="calc-key btn-op" onClick={invertSign}>
          ±
        </button>
        <button className="calc-key btn-op" onClick={squareRoot}>
          √
        </button>

        {/* Row 2 */}
        <button className="calc-key" onClick={memClear} title="Memory Clear">
          MC
        </button>
        <button className="calc-key" onClick={() => inputDigit('7')}>
          7
        </button>
        <button className="calc-key" onClick={() => inputDigit('8')}>
          8
        </button>
        <button className="calc-key" onClick={() => inputDigit('9')}>
          9
        </button>
        <button className="calc-key btn-op" onClick={() => performOperation('÷')}>
          /
        </button>

        {/* Row 3 */}
        <button className="calc-key" onClick={memRecall} title="Memory Recall">
          MR
        </button>
        <button className="calc-key" onClick={() => inputDigit('4')}>
          4
        </button>
        <button className="calc-key" onClick={() => inputDigit('5')}>
          5
        </button>
        <button className="calc-key" onClick={() => inputDigit('6')}>
          6
        </button>
        <button className="calc-key btn-op" onClick={() => performOperation('×')}>
          *
        </button>

        {/* Row 4 */}
        <button className="calc-key" onClick={memStore} title="Memory Store">
          MS
        </button>
        <button className="calc-key" onClick={() => inputDigit('1')}>
          1
        </button>
        <button className="calc-key" onClick={() => inputDigit('2')}>
          2
        </button>
        <button className="calc-key" onClick={() => inputDigit('3')}>
          3
        </button>
        <button className="calc-key btn-op" onClick={() => performOperation('-')}>
          -
        </button>

        {/* Row 5 */}
        <button className="calc-key" onClick={memAdd} title="Memory Add">
          M+
        </button>
        <button className="calc-key" onClick={() => inputDigit('0')}>
          0
        </button>
        <button className="calc-key" onClick={inputDecimal}>
          .
        </button>
        <button className="calc-key btn-op" onClick={() => performOperation('+')}>
          +
        </button>
        <button className="calc-key btn-danger" onClick={() => performOperation('=')}>
          =
        </button>
      </div>
    </div>
  )
}
