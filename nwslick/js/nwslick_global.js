var gui = require('nw.gui');
var win = gui.Window.get();

win.on('close', function() 
{
	win.hide();
	  
	var net = require('net');
	
	var HOST = 'localhost';
	var PORT = 19912;
	
	var client = new net.Socket();
	
	client.on('error', function (err)
	{
		if (console!=null) console.log("Closing nwslick...");
		win.close(true);
	});
	
	client.connect(PORT, HOST, function() 
	{
		if (console!=null) console.log('Connected to: ' + HOST + ':' + PORT);
		var command = 'shutdown';
		
		if (console!=null) console.log("Sending shutdown signal to jslick...");
		client.write(command+'\n');
		
		if (console!=null) console.log("Closing nwslick...");
		win.close(true);
	});
});
