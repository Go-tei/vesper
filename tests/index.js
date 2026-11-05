// Load every application module except the browser entry point so untested views
// remain visible in the coverage denominator. main.jsx only mounts the root.
const application = import.meta.webpackContext('../src', {
  recursive: true,
  regExp: /^\.\/(?!main\.jsx$).*\.jsx?$/,
});
application.keys().forEach(application);

// Discover React DOM specifications and isolated service specifications in webpack ESM.
const specifications = import.meta.webpackContext('./', {
  recursive: true,
  regExp: /\.spec\.(js|jsx)$/,
});
specifications.keys().forEach(specifications);
