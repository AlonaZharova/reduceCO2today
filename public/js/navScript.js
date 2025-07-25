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

    // Reset all
    [homeElement, aboutElement, contactElement, haElement, germanyElement, worldElement, ukElement].forEach(el => {
      if (el) el.classList.remove('active-site');
    });

    // Apply based on path
    if (currentPath === "/") {
      homeElement?.classList.add('active-site');
    } else if (currentPath === "/about") {
      aboutElement?.classList.add('active-site');
    } else if (currentPath === "/kontakt") {
      contactElement?.classList.add('active-site');
    } else if (currentPath === "/homeassistant") {
      haElement?.classList.add('active-site');
    } else if (currentPath === "/germany") {
      germanyElement?.classList.add('active-site');
    } else if (currentPath === "/world") {
      worldElement?.classList.add('active-site');
    } else if (currentPath === "/uk" || currentPath.startsWith("/results_uk")) {
      ukElement?.classList.add('active-site');
    }
  });
};

export default navFunction;