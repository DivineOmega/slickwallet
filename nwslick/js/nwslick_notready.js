
checkIfReady();

function checkIfReady()
{
	var command = 'ping';
	
	var net = require('net');

	var HOST = 'localhost';
	var PORT = 19912;

	var client = new net.Socket();
	
	client.on('error', function (err)
	{
		window.location = 'connection_error.html';
	});
	
	client.connect(PORT, HOST, function() 
	{
		if (console!=null) console.log('Connected to: ' + HOST + ':' + PORT);
	});
	
	client.on('data', function(data) 
	{
		if (data=='jslick:')
		{
			if (console!=null)  console.log('Sending command: '+command);
			client.write(command+'\n');
		}
		else if (data=='not_ready')
		{
			client.destroy();
		}
		else if (data=='pong')
		{
			client.destroy();
			window.location = 'index.html';
		}
		else if (data=='not_encrypted')
		{
			client.destroy();
			window.location = 'set_password.html';
		}
	});
	
	setTimeout(function(){ checkIfReady(); },1000);
	
}
