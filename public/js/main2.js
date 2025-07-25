import navFunction from './navScript.js';
if (window.innerWidth >= 768) {
    // Only run navFunction on devices with width >= 768px (typically desktops/tablets)
    navFunction();
}