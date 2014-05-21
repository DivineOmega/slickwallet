
jslickCommand = 'cd ./jslick/ && java -jar jslick.jar';

var isWin = /^win/.test(process.platform);

if (isWin) jslickCommand = 'cd .\\jslick\\ & .\\jslick.exe';

var exec = require('child_process').exec, child;
child = exec(jslickCommand,
  function (error, stdout, stderr)
  {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(error !== null)
    {
		if (error.toString().indexOf("Address already in use") > -1)
		{
			// jslick already running
			window.location = 'index.html';
		}
		else
		{
			// jslick needs to be started
			console.log('exec error: ' + error);
			alert('Sorry, there has been an error starting Slick Wallet.\n\nDetails: '+error);
			window.close();
		}
    }
});

setTimeout(function(){ window.location = 'index.html'; }, 6000);
