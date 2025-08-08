document.addEventListener('DOMContentLoaded', function () {
    // Country data
    const countries = [
        { code: "AF", name: "Afghanistan" },
        { code: "AO", name: "Angola" },
        { code: "AQ", name: "Antarctica" },
        { code: "AG", name: "Antigua and Barbuda" },
        { code: "AR", name: "Argentina" },
        { code: "AU", name: "Australia" },
        { code: "AT", name: "Austria" },
        { code: "BS", name: "Bahamas" },
        { code: "BD", name: "Bangladesh" },
        { code: "BB", name: "Barbados" },
        { code: "BE", name: "Belgium" },
        { code: "BZ", name: "Belize" },
        { code: "BJ", name: "Benin" },
        { code: "BO", name: "Bolivia" },
        { code: "BR", name: "Brazil" },
        { code: "BG", name: "Bulgaria" },
        { code: "BF", name: "Burkina Faso" },
        { code: "BI", name: "Burundi" },
        { code: "CV", name: "Cabo Verde" },
        { code: "KH", name: "Cambodia" },
        { code: "CA", name: "Canada" },
        { code: "CF", name: "Central African Republic" },
        { code: "TD", name: "Chad" },
        { code: "CL", name: "Chile" },
        { code: "CN", name: "China" },
        { code: "CO", name: "Colombia" },
        { code: "KM", name: "Comoros" },
        { code: "HR", name: "Croatia" },
        { code: "CU", name: "Cuba" },
        { code: "CZ", name: "Czech Republic" },
        { code: "CD", name: "Democratic Rep. of the Congo" },
        { code: "DK", name: "Denmark" },
        { code: "DJ", name: "Djibouti" },
        { code: "DM", name: "Dominica" },
        { code: "DO", name: "Dominican Republic" },
        { code: "EC", name: "Ecuador" },
        { code: "ER", name: "Eritrea" },
        { code: "EE", name: "Estonia" },
        { code: "ET", name: "Ethiopia" },
        { code: "FK", name: "Falkland Islands" },
        { code: "FJ", name: "Fiji" },
        { code: "FI", name: "Finland" },
        { code: "FR", name: "France" },
        { code: "TF", name: "French Southern Territories" },
        { code: "DE", name: "Germany" },
        { code: "GR", name: "Greece" },
        { code: "GN", name: "Guinea" },
        { code: "GW", name: "Guinea-Bissau" },
        { code: "GY", name: "Guyana" },
        { code: "HT", name: "Haiti" },
        { code: "HU", name: "Hungary" },
        { code: "IN", name: "India" },
        { code: "IE", name: "Ireland" },
        { code: "IT", name: "Italy" },
        { code: "JM", name: "Jamaica" },
        { code: "JP", name: "Japan" },
        { code: "LV", name: "Latvia" },
        { code: "LS", name: "Lesotho" },
        { code: "LR", name: "Liberia" },
        { code: "LT", name: "Lithuania" },
        { code: "MG", name: "Madagascar" },
        { code: "MW", name: "Malawi" },
        { code: "MV", name: "Maldives" },
        { code: "ML", name: "Mali" },
        { code: "MR", name: "Mauritania" },
        { code: "MU", name: "Mauritius" },
        { code: "MX", name: "Mexico" },
        { code: "FM", name: "Micronesia (Federated States of)" },
        { code: "MZ", name: "Mozambique" },
        { code: "MM", name: "Myanmar" },
        { code: "NP", name: "Nepal" },
        { code: "NL", name: "Netherlands" },
        { code: "NE", name: "Niger" },
        { code: "NO", name: "Norway" },
        { code: "PW", name: "Palau" },
        { code: "PG", name: "Papua New Guinea" },
        { code: "PY", name: "Paraguay" },
        { code: "PE", name: "Peru" },
        { code: "PL", name: "Poland" },
        { code: "PT", name: "Portugal" },
        { code: "RO", name: "Romania" },
        { code: "RW", name: "Rwanda" },
        { code: "WS", name: "Samoa" },
        { code: "SN", name: "Senegal" },
        { code: "SC", name: "Seychelles" },
        { code: "SL", name: "Sierra Leone" },
        { code: "SG", name: "Singapore" },
        { code: "SK", name: "Slovakia" },
        { code: "SI", name: "Slovenia" },
        { code: "SB", name: "Solomon Islands" },
        { code: "SO", name: "Somalia" },
        { code: "GS", name: "South Georgia" },
        { code: "KR", name: "South Korea" },
        { code: "SS", name: "South Sudan" },
        { code: "ES", name: "Spain" },
        { code: "LC", name: "St. Lucia" },
        { code: "VC", name: "St. Vincent and the Grenadines" },
        { code: "SD", name: "Sudan" },
        { code: "SR", name: "Suriname" },
        { code: "SE", name: "Sweden" },
        { code: "CH", name: "Switzerland" },
        { code: "TL", name: "Timor-Leste" },
        { code: "TG", name: "Togo" },
        { code: "TO", name: "Tonga" },
        { code: "TT", name: "Trinidad and Tobago" },
        { code: "UG", name: "Uganda" },
        { code: "GB", name: "United Kingdom" },
        { code: "TZ", name: "United Republic of Tanzania" },
        { code: "US", name: "United States" },
        { code: "UY", name: "Uruguay" },
        { code: "VU", name: "Vanuatu" },
        { code: "VE", name: "Venezuela" },
        { code: "YE", name: "Yemen" },
        { code: "ZM", name: "Zambia" }
    ];

    // Create container
    const container = document.createElement('div');
    container.className = "mb-6 w-full max-w-md mx-auto flex flex-col items-center";

    // Label
    const label = document.createElement('label');
    label.className = "block text-white text-lg font-semibold mb-2 text-center";
    label.style.paddingTop = "20px";
    label.textContent = "Or select from the list:";
    container.appendChild(label);

    // Dropdown wrapper
    const wrapper = document.createElement('div');
    wrapper.className = "relative w-full max-w-lg mx-auto";
    container.appendChild(wrapper);

    // Button (initial view)
    const btn = document.createElement('button');
    btn.id = "expCountryDropdownBtn";
    btn.className = "w-full inline-block bg-gradient-to-r from-customThree to-customEight hover:from-customEight hover:to-customThree text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-customThree focus:ring-offset-2 focus:ring-offset-transparent flex justify-between items-center";
    btn.innerHTML = `<span id="expSelectedCountryText">Choose the country</span>
        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>`;
    wrapper.appendChild(btn);

    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.id = "expCountryDropdown";
    dropdown.className = "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg hidden";
    wrapper.appendChild(dropdown);

    // Dropdown list
    const ul = document.createElement('ul');
    ul.className = "h-32 py-2 overflow-y-auto text-gray-700";
    dropdown.appendChild(ul);

    // Search input (hidden initially)
    const searchInput = document.createElement('input');
    searchInput.type = "text";
    searchInput.placeholder = "Type to search country...";
    searchInput.className = "w-full mb-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-customThree bg-white text-gray-900";
    searchInput.style.display = "none";
    wrapper.insertBefore(searchInput, btn);

    // Function to render country options
    function renderCountryOptions(filter = "") {
        ul.innerHTML = "";
        const filtered = countries.filter(country =>
            country.name.toLowerCase().includes(filter.toLowerCase())
        );
        filtered.forEach(country => {
            const li = document.createElement('li');
            const div = document.createElement('div');
            div.className = "country-option px-4 py-2 hover:bg-gray-100 cursor-pointer";
            div.setAttribute('data-value', country.code);
            div.textContent = country.name;
            li.appendChild(div);
            ul.appendChild(li);

            div.addEventListener('click', function () {
                btn.querySelector('#expSelectedCountryText').textContent = country.name;
                dropdown.classList.add('hidden');
                searchInput.style.display = "none";
                btn.style.display = "flex";
                window.location.href = `/world?countryCode=${country.code}&country=${encodeURIComponent(country.name)}`;
            });
        });

        // Set dropdown height to show max 3 items
        const itemCount = ul.childElementCount;
        if (itemCount === 0) {
            dropdown.style.height = "60px";
        } else {
            // Limit to 3 items maximum (each ~40px + padding)
            const maxHeight = 3 * 40 + 16; // 3 items * 40px + 16px padding
            dropdown.style.height = maxHeight + "px";
        }
    }

    // Initial render
    renderCountryOptions();

    // Toggle dropdown and show search input on button click
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        btn.style.display = "none";
        searchInput.style.display = "block";
        searchInput.value = "";
        renderCountryOptions();
        dropdown.classList.remove('hidden');
        searchInput.focus();
    });

    // Listen for input changes
    searchInput.addEventListener('input', function () {
        renderCountryOptions(searchInput.value);
        dropdown.classList.remove('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
        dropdown.classList.add('hidden');
        searchInput.style.display = "none";
        btn.style.display = "flex";
    });

    // Prevent closing when clicking inside dropdown
    dropdown.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // Add to the correct position in the page
    const target = document.getElementById('DropdownContainer');
    if (target) {
        target.appendChild(container);
    }
});