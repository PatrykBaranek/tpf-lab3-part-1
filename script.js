let clickCount = 0;

const formElement = document.getElementById('form');
const countrySelect = document.getElementById('country');
const countryCodeSelect = document.getElementById('countryCode');
const countrySearchInput = document.getElementById('countrySearch');
const clicksInfo = document.getElementById('click-count');
const formStatusMessage = document.getElementById('form-status-message');

// Store all country options for filtering
let allCountryOptions = [];

function handleClick() {
  clickCount++;
  if (clicksInfo) {
    clicksInfo.innerText = clickCount;
  }
}

async function fetchAndFillCountries() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name');

    if (!response.ok) {
      throw new Error('Błąd pobierania danych krajów');
    }

    const data = await response.json();
    const countries = data
      .map((country) => country.name.common)
      .sort((a, b) => a.localeCompare(b));

    countrySelect.innerHTML = '<option value="">Wybierz kraj...</option>';
    allCountryOptions = [];

    countries.forEach((countryName) => {
      const option = document.createElement('option');
      option.value = countryName;
      option.textContent = countryName;
      countrySelect.appendChild(option);
      allCountryOptions.push(option.cloneNode(true)); // Store a copy for filtering
    });

    return countries;
  } catch (error) {
    console.error('Wystąpił błąd podczas pobierania krajów:', error);
    countrySelect.innerHTML =
      '<option value="">Błąd ładowania krajów</option>';
    return [];
  }
}

function setCountryUI(countryName) {
  if (countrySelect) {
    let found = false;
    for (let option of countrySelect.options) {
      if (option.value.toLowerCase() === countryName.toLowerCase() || option.text.toLowerCase() === countryName.toLowerCase()) {
        option.selected = true;
        found = true;
        break;
      }
    }

    if (found) {
      // Trigger change to update dependent elements if any, or directly call next function
      getCountryCode(countrySelect.value);
    } else {
      console.warn(
        `Kraj "${countryName}" nie znaleziony na liście. Może wymagać dodania.`
      );
      // Fallback or add new option if necessary
      // For now, we assume fetchAndFillCountries has most common names
    }
  }
}

function setCountryDialCodeUI(dialCode, countryNameForLabel = '') {
  if (countryCodeSelect) {
    let found = false;
    const normalizedDialCode = dialCode.startsWith('+')
      ? dialCode
      : `+${dialCode}`;

    for (let option of countryCodeSelect.options) {
      if (option.value === normalizedDialCode) {
        option.selected = true;
        found = true;
        break;
      }
    }
    if (!found && normalizedDialCode) {
      const label = countryNameForLabel
        ? `${normalizedDialCode} (${countryNameForLabel})`
        : `${normalizedDialCode} (Auto-wykryty)`;
      const newOption = new Option(label, normalizedDialCode, false, true);
      countryCodeSelect.add(newOption, countryCodeSelect.options[1]);
      newOption.selected = true;
    } else if (!normalizedDialCode) {
      console.warn('Numer kierunkowy jest pusty, nie można ustawić.');
    }
  }
}

function getCountryByIP() {
  fetch('https://get.geojs.io/v1/ip/geo.json')
    .then((response) => response.json())
    .then((data) => {
      const countryName = data.country;
      if (countryName) {
        setCountryUI(countryName);
      }
    })
    .catch((error) => {
      console.error('Błąd pobierania danych z serwera GeoJS:', error);
    });
}

function getCountryCode(countryName) {
  if (!countryName) return;
  const apiUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=idd,name`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Błąd pobierania danych o kodzie kierunkowym');
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.length > 0) {
        const countryData = data[0];
        let dialCodeToSet = '';

        if (countryData.idd && countryData.idd.root) {
          dialCodeToSet = countryData.idd.root;
          if (
            countryData.idd.suffixes &&
            countryData.idd.suffixes.length === 1 &&
            /^\d{1,3}$/.test(countryData.idd.suffixes[0]) && // Suffix is 1-3 digits
            countryData.idd.suffixes[0] !== ''
          ) {
            dialCodeToSet += countryData.idd.suffixes[0];
          }
        }

        if (dialCodeToSet) {
          setCountryDialCodeUI(dialCodeToSet, countryData.name.common);
        } else {
          console.warn(
            'Nie udało się ustalić kodu kierunkowego dla:',
            countryName
          );
        }
      }
    })
    .catch((error) => {
      console.error('Wystąpił błąd podczas pobierania kodu kierunkowego:', error);
    });
}

function handleCountrySearch() {
  const searchTerm = countrySearchInput.value.toLowerCase();
  // Clear current options except the first placeholder
  while (countrySelect.options.length > 1) {
    countrySelect.remove(1);
  }

  const filteredOptions = allCountryOptions.filter(option => {
    if (option.value === "") return true;
    return option.text.toLowerCase().includes(searchTerm);
  });

  if (countrySelect.options[0]?.value !== "") {
    const placeholder = document.createElement('option');
    placeholder.value = "";
    placeholder.textContent = "Wybierz kraj...";
    countrySelect.prepend(placeholder);
  }


  filteredOptions.forEach(optionNode => {
    if(optionNode.value !== "") {
      countrySelect.appendChild(optionNode.cloneNode(true));
    }
  });

  if (searchTerm === "") {
    while (countrySelect.options.length > 1) countrySelect.remove(1);
    allCountryOptions.forEach(opt => {
      if(opt.value !== "") countrySelect.appendChild(opt.cloneNode(true));
    });
  }

  let currentSelectedValue = countrySelect.value;
  let currentSelectionStillVisible = false;
  for(let i=0; i<countrySelect.options.length; i++){
    if(countrySelect.options[i].value === currentSelectedValue){
      countrySelect.selectedIndex = i;
      currentSelectionStillVisible = true;
      break;
    }
  }
  if(!currentSelectionStillVisible && countrySelect.options.length > 1){
    countrySelect.selectedIndex = (countrySelect.options[0].value === "" ? 1 : 0);
  } else if (!currentSelectionStillVisible && countrySelect.options.length === 1 && countrySelect.options[0].value === "") {
    countrySelect.selectedIndex = 0;
  }

}


// Event Listeners
document.addEventListener('click', handleClick);

if (countrySearchInput) {
  countrySearchInput.addEventListener('input', handleCountrySearch);
}

if (formElement) {
  formElement.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      if (event.target.tagName.toLowerCase() === 'textarea') {
        return; // Allow Enter in textareas
      }
      const submitButton = formElement.querySelector('button[type="submit"]');
      if (submitButton && !event.target.classList.contains('btn')) { // Avoid double action if enter on button
        event.preventDefault();
        submitButton.click();
      }
    }
  });

  formElement.addEventListener('submit', function (event) {
    // Custom validation for radio groups
    const shippingRadios = document.querySelectorAll('input[name="shippingMethodRadio"]');
    const paymentRadios = document.querySelectorAll('input[name="paymentMethodRadio"]');
    let shippingValid = Array.from(shippingRadios).some(radio => radio.checked);
    let paymentValid = Array.from(paymentRadios).some(radio => radio.checked);

    const shippingFeedback = document.getElementById('shippingMethodFeedback');
    const paymentFeedback = document.getElementById('paymentMethodFeedback');

    if (!shippingValid) {
        shippingFeedback.style.display = 'block';
    } else {
        shippingFeedback.style.display = 'none';
    }

    if (!paymentValid) {
        paymentFeedback.style.display = 'block';
    } else {
        paymentFeedback.style.display = 'none';
    }


    if (!formElement.checkValidity() || !shippingValid || !paymentValid) {
      event.preventDefault();
      event.stopPropagation();
      if (formStatusMessage) formStatusMessage.textContent = "Proszę poprawić błędy w formularzu.";
    } else {
      if (formStatusMessage) formStatusMessage.textContent = "Dane zostały wysłane (symulacja)!";
      // Here you would typically send the form data
      console.log('Formularz poprawny, gotowy do wysłania (symulacja).');
    }
    formElement.classList.add('was-validated');
  }, false);
}

(async () => {
  await fetchAndFillCountries();
  getCountryByIP();
})();
