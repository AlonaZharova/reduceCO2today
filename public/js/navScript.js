const navFunction = () => {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("starting nav script");

    const currentPath = window.location.pathname;
    console.log("currentPath", currentPath);

    const homeElement = document.getElementById("home");
    const aboutElement = document.getElementById("about");
    const contactElement = document.getElementById("contact");
    const haElement = document.getElementById("homeassistant");
    const germanyElement = document.getElementById("germany");
    const worldElement = document.getElementById("world");
    const ukElement = document.getElementById("uk");

    console.log("Found elements:", {
      home: homeElement,
      about: aboutElement,
      contact: contactElement,
      ha: haElement,
      germany: germanyElement,
      world: worldElement,
      uk: ukElement
    });

    // Reset all
    [homeElement, aboutElement, contactElement, haElement, germanyElement, worldElement, ukElement].forEach(el => {
      if (el) {
        el.classList.remove('active-site');
        console.log("Removed active-site from:", el.id);
      }
    });

    // Apply based on path
    if (currentPath === "/") {
      homeElement?.classList.add('active-site');
      console.log("Added active-site to home");
    } else if (currentPath === "/about") {
      aboutElement?.classList.add('active-site');
      console.log("Added active-site to about");
    } else if (currentPath === "/kontakt") {
      contactElement?.classList.add('active-site');
      console.log("Added active-site to contact");
    } else if (currentPath === "/homeassistant" || currentPath === "/tutorial1" || currentPath === "/tutorial2" || currentPath === "/tutorial3" || currentPath === "/tutorial4") {
      haElement?.classList.add('active-site');
      console.log("Added active-site to homeassistant");
    } else if (currentPath === "/germany") {
      germanyElement?.classList.add('active-site');
      console.log("Added active-site to germany");
    } else if (currentPath === "/world") {
      worldElement?.classList.add('active-site');
      console.log("Added active-site to world");
    } else if (currentPath === "/uk" || currentPath.startsWith("/results_uk")) {
      ukElement?.classList.add('active-site');
      console.log("Added active-site to uk");
    }
  });
};

export default navFunction;