document
  .getElementById("emailSubscriptionForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const emailInput = document.getElementById("emailInput");
    const emailField = document.getElementById("emailField");
    const emailSubscriptionForm = document.getElementById("emailSubscriptionForm");

    const emailInputValue = emailInput.value;
    const region = document.getElementById("regionInput").value;
    console.log(emailInputValue);
    // email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(emailInputValue)) {
      // Assume a backend endpoint /subscribe for email subscriptions
      fetch("/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInputValue, region }),
      })
        .then((response) => {
          if (!response.ok) {
            // If response status code is not OK, throw an error with the status text
            throw new Error(
              "Network response was not ok: " + response.statusText
            );
          }
          emailSubscriptionForm.innerHTML =
            '<p class="m-3">Thank you for subscribing to our daily Email recomendations! A confirmation email has been send to you.</p>';
          //return response.json(); // This is a Promise
        })
        .catch((error) => {
          console.error("Subscription error:", error);
          // Update the HTML to show a more descriptive error message
          document.getElementById(
            "subscribeControls"
          ).innerHTML = `<p class="m-3">Error processing subscription. Details: ${error.message}</p>`;
        });
    } else {
      // when the email is not valid Feedback is displayed for the user
      emailInput.classList.remove("border-white");
      emailInput.classList.add("border-red-400");
      const errorMessage = document.createElement("p");
      errorMessage.id = "errorMessage";
      errorMessage.classList.add("text-red-500", "border-red");
      errorMessage.textContent = "Please enter a valid email address!";
      if(emailField.childElementCount === 1) emailField.appendChild(errorMessage);
    }
  });


  document
  .getElementById("whatsAppSubscriptionForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const phoneInput = document.getElementById("phoneInput");
    const phoneField = document.getElementById("phoneField");
    const whatsAppSubscriptionForm = document.getElementById("whatsAppSubscriptionForm");

    const phoneInputValue = phoneInput.value;
    const formattedPhone = phoneInputValue.replace(/\s+/g, "");
    console.log(formattedPhone)
    const region = document.getElementById("regionInput").value;
    
    // email validation
    const phoneRegex = /^\+\d+(\d{10,14})$/;
    if (phoneRegex.test(formattedPhone)) {
      // Assume a backend endpoint /subscribe for whatsapp subscriptions
      fetch("/subscribe/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhone, region }),
      })
        .then((response) => {
          if (!response.ok) {
            // If response status code is not OK, throw an error with the status text
            throw new Error(
              "Network response was not ok: " + response.statusText
            );
          }
          whatsAppSubscriptionForm.innerHTML =
            '<p class="m-3">Thank you for subscribing to our daily WhatsApp recomendations!</p>';
          //return response.json(); // This is a Promise
        })
        .catch((error) => {
          console.error("Subscription error:", error);
          // Update the HTML to show a more descriptive error message
          document.getElementById(
            "subscribeControls"
          ).innerHTML = `<p class="m-3">Error processing subscription. Details: ${error.message}</p>`;
        });
    } else {
      // when the email is not valid Feedback is displayed for the user
      phoneInput.classList.remove("border-white");
      phoneInput.classList.add("border-red-400");
      const errorMessage = document.createElement("p");
      errorMessage.id = "errorMessage";
      errorMessage.classList.add("text-red-500", "border-red");
      errorMessage.textContent = "Please enter a valid phone number!";
      if(phoneField.childElementCount === 1) phoneField.appendChild(errorMessage);
    }
  });