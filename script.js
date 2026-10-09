(() => {
  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");
  const labelEl = document.getElementById("display-label");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeLabel = document.getElementById("theme-label");
  let expression = "";
  let finalized = false;

  const isOperator = key => ["+", "−", "×", "÷"].includes(key);

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "Cannot divide by zero";
    if (Object.is(value, -0)) value = 0;
    return String(Number(value.toPrecision(11)));
  }

  // Safe arithmetic parser: supports numbers, unary minus, +, −, × and ÷.
  function calculate(source) {
    if (!source) return null;
    let normalized = source.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    normalized = normalized.replace(/[+\-*/]$/, "");
    if (!normalized || normalized === "-") return null;

    const tokens = normalized.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/]/g);
    if (!tokens || tokens.join("") !== normalized) return null;

    const values = [];
    const operators = [];
    const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

    function apply() {
      if (values.length < 2 || !operators.length) return false;
      const right = values.pop();
      const left = values.pop();
      const op = operators.pop();
      if (op === "+") values.push(left + right);
      else if (op === "-") values.push(left - right);
      else if (op === "*") values.push(left * right);
      else if (op === "/") values.push(left / right);
      return true;
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (/^(?:\d|\.)/.test(token)) {
        values.push(Number(token));
      } else if (token === "-" && (i === 0 || (precedence[tokens[i - 1]] !== undefined))) {
        const next = tokens[i + 1];
        if (!next || !/^(?:\d|\.)/.test(next)) return null;
        values.push(-Number(next));
        i++;
      } else {
        if (!values.length) return null;
        while (operators.length && precedence[operators[operators.length - 1]] >= precedence[token]) {
          if (!apply()) return null;
        }
        operators.push(token);
      }
    }
    while (operators.length) if (!apply()) return null;
    return values.length === 1 ? values[0] : null;
  }

  function updateDisplay() {
    expressionEl.textContent = expression || "0";
    labelEl.textContent = finalized ? "YOUR ANSWER" : "YOUR EXPRESSION";
    const answer = calculate(expression);
    resultEl.textContent = answer === null ? "0" : formatNumber(answer);
  }

  function pressKey(key) {
    if (key === "AC") {
      expression = "";
      finalized = false;
      updateDisplay();
      return;
    }
    if (key === "backspace") {
      expression = expression.slice(0, -1);
      finalized = false;
      updateDisplay();
      return;
    }
    if (key === "=") {
      const answer = calculate(expression);
      if (answer !== null) {
        expression = formatNumber(answer);
        finalized = true;
      }
      updateDisplay();
      return;
    }
    if (key === "%") {
      const value = calculate(expression);
      if (value !== null && Number.isFinite(value)) {
        expression = formatNumber(value / 100);
        finalized = false;
      }
      updateDisplay();
      return;
    }
    if (isOperator(key)) {
      if (!expression) {
        if (key === "−") expression = "−";
      } else if (isOperator(expression.slice(-1))) {
        if (expression === "−") return;
        expression = expression.slice(0, -1) + key;
      } else {
        expression += key;
      }
      finalized = false;
      updateDisplay();
      return;
    }
    if (key === ".") {
      const parts = expression.split(/[+−×÷]/);
      const activeNumber = parts[parts.length - 1] || "";
      if (activeNumber.includes(".")) return;
      expression = finalized ? "0." : expression + (activeNumber ? "." : "0.");
      finalized = false;
      updateDisplay();
      return;
    }
    if (finalized) {
      expression = key;
      finalized = false;
    } else {
      expression = expression === "0" ? key : expression + key;
    }
    updateDisplay();
  }

  document.getElementById("keypad").addEventListener("click", event => {
    const button = event.target.closest("button[data-key]");
    if (button) pressKey(button.dataset.key);
  });

  document.addEventListener("keydown", event => {
    if (/^\d$/.test(event.key)) pressKey(event.key);
    else if (event.key === ".") pressKey(".");
    else if (event.key === "+") pressKey("+");
    else if (event.key === "-") pressKey("−");
    else if (event.key === "*") pressKey("×");
    else if (event.key === "/") { event.preventDefault(); pressKey("÷"); }
    else if (event.key === "Enter" || event.key === "=") pressKey("=");
    else if (event.key === "Backspace") pressKey("backspace");
    else if (event.key === "Escape" || event.key === "Delete") pressKey("AC");
    else if (event.key === "%") pressKey("%");
  });

  themeToggle.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    themeIcon.textContent = dark ? "☀" : "☾";
    themeLabel.textContent = dark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  });

  updateDisplay();
})();
