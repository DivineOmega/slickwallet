var passwordErrorText;

$('#set_password_button').click(function() 
{
	if ($('#password').val()=='')
	{
		$('#password_set_status').html('You\'ve got to enter a password.');
		$('#password_set_status').show();
	}
	else if ($('#password').val().length<12)
	{
		$('#password_set_status').html('Your password has got to be at least 12 character long. Maybe try a memorable sentence?');
		$('#password_set_status').show();
	}
	else if ($('#confirm_password').val()=='')
	{
		$('#password_set_status').html('Whoops, you need to type your password into both text boxes.');
		$('#password_set_status').show();
	}
	else if ($('#password').val()!=$('#confirm_password').val())
	{
		$('#password_set_status').html('Sorry, the two passwords do not match. Try retyping them.');
		$('#password_set_status').show();
	}
	else
	{
		setPassword($('#password').val())
	}
});

function displayPasswordErrorText()
{
	if(typeof passwordErrorText!='undefined' && passwordErrorText!='')
	{
		$('#password_set_status').html(passwordErrorText);
		$('#password_set_status').show();
	}
}

function setPassword(password)
{
	var command = 'set_password';
	command += ' ';
	command += window.btoa(password);
	
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
		console.log('Connected to: ' + HOST + ':' + PORT);
	});
	
	client.on('data', function(data) 
	{
		if (data=='jslick:')
		{
			if (console!=null)  console.log('Sending command: (command hidden as it contains password)');
			client.write(command+'\n');
		}
		else
		{
			client.destroy();
			
			if (command.startsWith('set_password'))
			{
				if (data=='password_set')
				{
					window.location = 'index.html';
				}
				else
				{
					passwordErrorText = data.toString();
					displayPasswordErrorText();
				}
			}
		}
	});
	
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}
