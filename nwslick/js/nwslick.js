var satoshisInABitcoin = 100000000;

var availableBalance;
var estimatedBalance;
var incomingBitcoins;
var mainAddress;
var qrcode = new QRCode('main_address_qrcode');
var sendingStatus;

var gui = require('nw.gui');
var win = gui.Window.get();


loopUpdateBalance();
sendCommand('get_main_address');

$('#qr_code_reader_button').click(function() 
{
	window.location = 'qr_code_reader.html';
});

$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

if ($.urlParam('send_to_address')!=null && $.urlParam('send_to_address')!='')
{
	$('#main_tabs a[href="#send_bitcoins_tab"]').tab('show');
	$('#send_to_address').val($.urlParam('send_to_address'));
}

$('#send_bitcoins_button').click(function() 
{
	var satoshiAmount = ($('#amount_to_send').val().toString()*satoshisInABitcoin).toFixed(0);
	
	console.log('Amount of send (BTC): '+$('#amount_to_send').val().toString());
	console.log('Amount to send (Satoshis): '+satoshiAmount);
	
	var command = 'send_bitcoins ';
	command += $('#send_to_address').val();
	command += ' ';
	command += (satoshiAmount);
	command += ' ';
	command += window.btoa($('#password').val());
	
	$('#send_to_address').val('')
	$('#amount_to_send').val('')
	$('#password').val('')
	
	sendingStatus = 'Sending bitcoins...';
	guiUpdate();
	
	sendCommand(command);
	
});

function guiUpdate()
{
	if (typeof availableBalance!='undefined')
	{
		$('#balance').html(availableBalance);
		// $('#balance').attr('title', availableBalance);
	}
	
	incomingBitcoins = ((estimatedBalance*satoshisInABitcoin)-(availableBalance*satoshisInABitcoin))/satoshisInABitcoin;
	if (incomingBitcoins>0)
	{
		$('#incoming').html('(+ ' + incomingBitcoins + ' incoming)');
	}
	else
	{
		$('#incoming').html('');
	}
	
	if (typeof mainAddress!='undefined')
	{
		$('#main_address').html(mainAddress);
		qrcode.makeCode(mainAddress);
		$('#main_address_qrcode').attr('title', '');
	}
	
	if(typeof sendingStatus!='undefined' && sendingStatus!='')
	{
		if (sendingStatus.startsWith('SUCCESS:::'))
		{
			var sendingStatusParts = sendingStatus.split(':::');
			$('#sending_status').html(sendingStatusParts[1]);
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-success');
		}
		else if (sendingStatus.startsWith('ERROR:::'))
		{
			var sendingStatusParts = sendingStatus.split(':::');
			$('#sending_status').html(sendingStatusParts[1]);
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-danger');
		}
		else
		{
			$('#sending_status').html(sendingStatus.split(':::'));
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-info');
		}
	}
}

function loopUpdateBalance()
{
	sendCommand('get_available_balance');
	sendCommand('get_estimated_balance');
	setTimeout(function(){ loopUpdateBalance(); }, 2500);
}

function sendCommand(command)
{
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
			if (console!=null)  console.log('Sending command: '+command);
			client.write(command+'\n');
		}
		else if (data=='not_ready')
		{
			client.destroy();
			window.location = 'not_ready.html';
		}
		else if (data=='not_encrypted')
		{
			client.destroy();
			window.location = 'set_password.html';
		}
		else
		{
			console.log('Response received: ' + data);
			client.destroy();
			
			if (command=='get_available_balance')
			{
				availableBalance = (data.toString()/satoshisInABitcoin);
			}
			else if (command=='get_estimated_balance')
			{
				estimatedBalance =  (data.toString()/satoshisInABitcoin);
			}
			else if (command=='get_main_address')
			{
				mainAddress = data.toString();
			}
			else if (command.startsWith('send_bitcoins'))
			{
				sendingStatus = data.toString();
			}
			
			guiUpdate();
		}
	});
	
	client.on('close', function() 
	{
		if (console!=null) console.log('Connection closed');
	});
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}
