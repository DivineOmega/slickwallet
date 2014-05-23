var satoshisInABitcoin = 100000000;

if (localStorage.fiatCurrency==undefined) localStorage.setItem('fiatCurrency', 'GBP');
$('#fiat_currency_setting').val(localStorage.fiatCurrency);

var minFee = 0.0001;
var availableBalance;
var estimatedBalance;
var incomingBitcoins;
var fiatValue = 0.00;
var mainAddress;
var qrcode = new QRCode('main_address_qrcode');
var sendingStatus;
var transactionTable;

var gui = require('nw.gui');
var win = gui.Window.get();
var clipboard = gui.Clipboard.get();

var fs = require('fs');

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

sendCommand('get_main_address');
loopUpdateBalance();
loopUpdateFiatValue();
loopUpdateTransactions();
loadAndShowApps();

$('#fiat_currency_setting').change(function() 
{
	localStorage.setItem('fiatCurrency', $('#fiat_currency_setting').val());
	if (localStorage.fiatCurrency!='')
	{
		sendCommand('get_bitcoin_value '+localStorage.fiatCurrency);
	}
	else
	{
		guiUpdate();
	}
});

$('#paste_address_button').click(function() 
{
	$('#send_to_address').val(clipboard.get('text'));
});

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
	
	setSendingEnabledState(false);
	
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
	
	if (typeof fiatValue!='undefined')
	{
		if (fiatValue>0 && localStorage.fiatCurrency!='')
		{
			$('#fiat_value').html((availableBalance*fiatValue).toFixed(2));
			$('#fiat_currency').html(localStorage.fiatCurrency);
		}
		else
		{
			$('#fiat_value').html('');
			$('#fiat_currency').html('');
		}
	}
	
	if (typeof mainAddress!='undefined')
	{
		$('#main_address').html(mainAddress);
		qrcode.makeCode(mainAddress);
		$('#main_address_qrcode').attr('title', '');
	}
	
	if (typeof minFee!='undefined')
	{
		$('#min_fee').html(minFee);
	}
	
	if (typeof transactionTable!='undefined')
	{
		$('#transaction_table').html(transactionTable);
	}
	
	if(typeof sendingStatus!='undefined' && sendingStatus!='')
	{
		if (sendingStatus.startsWith('SUCCESS:::'))
		{
			var sendingStatusParts = sendingStatus.split(':::');
			$('#sending_status').html(sendingStatusParts[1]);
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-success');
			
			setSendingEnabledState(true);
			blankSendingFields();			
		}
		else if (sendingStatus.startsWith('ERROR:::'))
		{
			var sendingStatusParts = sendingStatus.split(':::');
			$('#sending_status').html(sendingStatusParts[1]);
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-danger');
			
			setSendingEnabledState(true);
		}
		else
		{
			$('#sending_status').html(sendingStatus.split(':::'));
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-info');
		}
		
		sendingStatus = '';
	}
}

function blankSendingFields()
{
	$('#send_to_address').val("");
	$('#amount_to_send').val("");
	$('#password').val("");
}

$('#amount_to_send').keyup(function()
{
	var totalAmountToSend = parseFloat($('#amount_to_send').val())+minFee;
		
	if ($('#amount_to_send').val()==="")
	{
		$('#amount_to_send').css('border-color', '');
		$('#amount_alert').html('');
	}
	else if ($('#amount_to_send').val()===0)
	{
		$('#amount_to_send').css('border-color', '#ff0000');
		$('#amount_alert').html('You can\'t send zero bitcoins!');
	}
	else if ($('#amount_to_send').val()<0)
	{
		$('#amount_to_send').css('border-color', '#ff0000');
		$('#amount_alert').html('You can\'t send negative amounts!');
	}
	else if (totalAmountToSend>availableBalance)
	{
		$('#amount_to_send').css('border-color', '#ff0000');
		$('#amount_alert').html('You don\'t have enough bitcoin!');
	}
	else
	{
		$('#amount_to_send').css('border-color', '');
		$('#amount_alert').html('');
	}
});

function setSendingEnabledState(setSendingEnabled)
{
	if (setSendingEnabled==true)
	{
		$('#send_to_address').removeAttr("disabled");
		$('#amount_to_send').removeAttr("disabled");
		$('#password').removeAttr("disabled");
		$('#qr_code_reader_button').removeAttr("disabled");
		$('#send_bitcoins_button').removeAttr("disabled");
	}
	else
	{
		$('#send_to_address').attr("disabled", "disabled");
		$('#amount_to_send').attr("disabled", "disabled");
		$('#password').attr("disabled", "disabled");
		$('#qr_code_reader_button').attr("disabled", "disabled");
		$('#send_bitcoins_button').attr("disabled", "disabled");
	}
}

function loopUpdateBalance()
{
	sendCommand('get_available_balance');
	sendCommand('get_estimated_balance');
	setTimeout(function(){ loopUpdateBalance(); }, 2500);
}

function loopUpdateTransactions()
{
	sendCommand('get_transactions');
	setTimeout(function(){ loopUpdateTransactions(); }, 2500);
}

function loopUpdateFiatValue()
{
	sendCommand('get_bitcoin_value '+localStorage.fiatCurrency);
	setTimeout(function(){ loopUpdateFiatValue(); }, 1000*60*1);
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
			if (console!=null)
			{
				if (command.startsWith('send_bitcoins'))
				{
					console.log('Sending command: (command hidden as it contains password)');
				}
				else
				{
					console.log('Sending command: '+command);
				}
			}
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
			if (console!=null)
			{
				console.log('Response received: ' + data);
			}
			client.destroy();
			
			if (command=='get_available_balance')
			{
				availableBalance = (data.toString()/satoshisInABitcoin);
			}
			else if (command=='get_estimated_balance')
			{
				estimatedBalance =  (data.toString()/satoshisInABitcoin);
			}
			else if (command.startsWith('get_bitcoin_value'))
			{
				fiatValue = data.toString();
			}
			else if (command=='get_main_address')
			{
				mainAddress = data.toString();
			}
			else if (command.startsWith('send_bitcoins'))
			{
				sendingStatus = data.toString();
			}
			else if (command=='get_transactions')
			{
				transactionTable = createTransactionTable(data.toString());
			}
			
			guiUpdate();
		}
	});
	
	client.on('close', function() 
	{
		if (console!=null) console.log('Connection closed');
	});
}

function createTransactionTable(transactionData)
{
	var transactionTable = '';
	
	transactionTable += '<tr>';
	transactionTable += '<th>Date time</th>';
	transactionTable += '<th>Bitcoin address</th>';
	transactionTable += '<th>BTC</th>';
	transactionTable += '</tr>';
	
	txs = transactionData.split('\r\n');
	
	for (var i = 0; i < txs.length; i++) 
	{
		transactionTable += '<tr>';
		
		txDetails = txs[i].split(':::');
		
		if (txDetails.length==3)
		{
			for (var j = 0; j < txDetails.length; j++) 
			{			
				transactionTable += '<td>';
				
				if (j==2)
				{
					transactionTable += (txDetails[j]/satoshisInABitcoin);
				}
				else
				{
					transactionTable += txDetails[j];	
				}
				
				transactionTable += '</td>';
			}
		}
		
		transactionTable += '</tr>';
	}
	
	return transactionTable;
}

function loadAndShowApps()
{
	var appDirRoot = "./apps"
	var appDirs = fs.readdirSync(appDirRoot);
	
	var nameFile = 'name.txt';
	var descriptionFile = 'description.txt';
	var iconFile = 'icon.png';
	var indexFile = 'index.html';
	
	var totalAppDirs = appDirs.length;
	for (var i = 0; i < totalAppDirs; i++) 
	{
		var appDir = appDirRoot+'/'+appDirs[i];
		
		if (!fs.lstatSync(appDir).isDirectory()) continue;
		
		var appName = fs.readFileSync(appDir+'/'+nameFile, 'utf8');
		var appDescription = fs.readFileSync(appDir+'/'+descriptionFile, 'utf8');
				
		var appTableItem = '';
		
		appTableItem += '<tr>';
		appTableItem += '<td>';
		appTableItem += '<div id="app_icon">';
		appTableItem += '<img src="'+appDir+'/'+iconFile+'" />';
		appTableItem += '</div>';
		appTableItem += '</td>';
		appTableItem += '<td>';
		appTableItem += '<div id="app_name">';
		appTableItem += appName;
		appTableItem += '</div>';
		appTableItem += '<div id="app_description">';
		appTableItem += appDescription;
		appTableItem += '</div>';
		appTableItem += '<button class="btn btn-default" onclick="window.open(\''+appDir+'/'+indexFile+'\', \'_blank\');">Launch</button>';
		appTableItem += '</td>';
		appTableItem += '</tr>';
						
		$('#apps_table').append(appTableItem);
	}
}


