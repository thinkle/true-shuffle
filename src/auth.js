document.addEventListener("DOMContentLoaded", async function () {
  const app = document.querySelector("#app");

  // Check for an authorization code in the URL
  const queryParams = new URLSearchParams(window.location.search);
  const code = queryParams.get("code");

  // Function to update UI based on authentication status
  function updateUI(authenticated) {
    //app.innerHTML = ""; // Clear existing UI elements

    if (authenticated) {
      const logoutButton = document.createElement("button");
      logoutButton.innerHTML = "Logout from Spotify";
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("spotify_auth_code");
        updateUI(false); // Update UI to logged out state
      });
      app.appendChild(logoutButton);
    } else {
      const authButton = document.createElement("button");
      authButton.innerHTML = "Login to Spotify!";
      authButton.addEventListener("click", () => {
        console.log("Let's log in!");
        window.location.href = "/.netlify/functions/authenticate";
      });
      app.appendChild(authButton);
    }
  }

  if (code) {
    // If there's a code in the URL, exchange it for a token
    const response = await fetch("/.netlify/functions/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    // store the token in localStorage...
    localStorage.setItem("spotify_auth_token", data.access_token);
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
    // Remove code from URL without refreshing the page
    history.pushState(null, "", location.href.split("?")[0]);
    updateUI(true);
  } else if (localStorage.getItem("spotify_auth_token")) {
    // Check if we already have a code stored
    updateUI(true);
  } else {
    updateUI(false);
  }
});
