document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameInput  = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const msgInput   = document.getElementById("msg");

  const errorOutput = document.getElementById("error-output");
  const infoOutput  = document.getElementById("info-output");
  const formErrorsField = document.getElementById("form-errors");

  const formErrors = [];

  function clearOutputs() {
    errorOutput.textContent = "";
    infoOutput.textContent  = "";
    infoOutput.classList.remove("near-limit");
  }

  function showError(message, autoClearMs = 3500) {
    errorOutput.textContent = message;
    const current = message;

    setTimeout(() => {
      if (errorOutput.textContent === current) {
        errorOutput.textContent = "";
      }
    }, autoClearMs);
  }

  function showInfo(message, isNearLimit = false) {
    infoOutput.textContent = message;
    if (isNearLimit) {
      infoOutput.classList.add("near-limit");
    } else {
      infoOutput.classList.remove("near-limit");
    }
  }

  function flashField(field) {
    field.classList.add("field-flash");
    setTimeout(() => field.classList.remove("field-flash"), 180);
  }

  function getFieldErrorMessage(input, label) {
    const v = input.validity;

    if (v.valueMissing) {
      return `${label} is required.`;
    }
    if (v.typeMismatch) {
      return `${label} must be a valid ${input.type} address.`;
    }
    if (v.patternMismatch) {
      if (input === nameInput) {
        return "Name can only contain letters and spaces.";
      }
      if (input === phoneInput) {
        return "Phone can only contain digits, spaces, +, -, and parentheses.";
      }
      return `Please enter a valid ${label.toLowerCase()}.`;
    }
    if (v.tooShort) {
      return `${label} must be at least ${input.minLength} characters long.`;
    }
    if (v.tooLong) {
      return `${label} must be at most ${input.maxLength} characters long.`;
    }
    return `Invalid ${label.toLowerCase()}.`;
  }


  const nameAllowed = /^[A-Za-z\s]*$/;
  nameInput.addEventListener("input", () => {
    const value = nameInput.value;

    if (!nameAllowed.test(value)) {
      nameInput.setCustomValidity("Only letters and spaces are allowed in the name.");
      flashField(nameInput);
      showError("Only letters and spaces are allowed in the name.");
    } else {
      if (nameInput.validity.customError) {
        nameInput.setCustomValidity("");
      }
      if (errorOutput.textContent === "Only letters and spaces are allowed in the name.") {
        errorOutput.textContent = "";
      }
    }
  });

  const phoneAllowed = /^[0-9\-+()\s]*$/;
  phoneInput.addEventListener("input", () => {
    const value = phoneInput.value;

    if (!phoneAllowed.test(value)) {
      phoneInput.setCustomValidity(
        "Phone can only contain digits, spaces, +, -, and parentheses."
      );
      flashField(phoneInput);
      showError("Phone can only contain digits, spaces, +, -, and parentheses.");
    } else {
      if (phoneInput.validity.customError) {
        phoneInput.setCustomValidity("");
      }
      if (errorOutput.textContent === "Phone can only contain digits, spaces, +, -, and parentheses.") {
        errorOutput.textContent = "";
      }
    }
  });

  const maxMsgLength = msgInput.maxLength || 500;

  function updateMessageCounter() {
    const currentLength = msgInput.value.length;
    const remaining = maxMsgLength - currentLength;

    if (remaining >= 0) {
      const nearLimit = remaining <= 50;
      showInfo(`${remaining} characters remaining.`, nearLimit);
      if (msgInput.validity.customError) {
        msgInput.setCustomValidity("");
      }
    } else {
      msgInput.setCustomValidity("Your comment exceeds the maximum allowed length.");
      showError("Your comment is too long. Please shorten it.");
    }
  }

  msgInput.addEventListener("input", updateMessageCounter);
  updateMessageCounter();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorOutput.textContent = "";

    const currentErrors = [];

    const fields = [
      { el: nameInput,  label: "Name",     field: "name" },
      { el: emailInput, label: "Email",    field: "email" },
      { el: phoneInput, label: "Phone",    field: "phone" },
      { el: msgInput,   label: "Comments", field: "msg" }
    ];

    updateMessageCounter();

    fields.forEach(({ el, label, field }) => {
        el.setCustomValidity("");

        if (!el.checkValidity()) {
            const message = getFieldErrorMessage(el, label);
            el.setCustomValidity(message);

            currentErrors.push({
            field,
            label,
            message,
            value: el.value,
            time: new Date().toISOString()
            });
        }
    });

    if (currentErrors.length > 0) {
      formErrors.push(...currentErrors);

      const first = currentErrors[0];
      showError(`${first.label}: ${first.message}`);

      const firstField = fields.find(f => f.field === first.field);
      if (firstField && firstField.el) {
        firstField.el.focus();
      }

      return;
    }

    showInfo("Form is valid. Submitting now…", false);

    if (formErrorsField) {
      try {
        formErrorsField.value = JSON.stringify(formErrors);
      } catch {
        formErrorsField.value = "[]";
      }
    }
    form.submit();
  });
});
