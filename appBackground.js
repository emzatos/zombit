chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('appWindow.html', {
    'bounds': {
      'width': 1200,
      'height': 800
    },
    'minWidth': 1200,
  	'minHeight': 800
  });
});