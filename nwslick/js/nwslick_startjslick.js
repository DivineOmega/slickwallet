
var exec = require('child_process').exec, child;
child = exec('./jslick/jslick.jar',
  function (error, stdout, stderr)
  {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(error !== null)
    {
      console.log('exec error: ' + error);
      alert('Sorry, there has been an error starting the \'jslick\' component of Slick Wallet.\n\nDetails: '+error);
      Window.close();
    }
});

setTimeout(function(){ window.location = 'index.html'; }, 3000);
