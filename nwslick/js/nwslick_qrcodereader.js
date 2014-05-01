
$('#reader').html5_qrcode(
	function(data)
	{
		var bitcoin_prefix = 'bitcoin:';
		
		if (data.startsWith(bitcoin_prefix)) data = data.substring(bitcoin_prefix.length);
		
		window.location = 'index.html#send_bitcoins_tab?send_to_address='+data;
	},
	function(error)
	{
		
	}, 
	function(videoError)
	{
		alert('Sorry, we could not start the QR Code reader.');
		window.location = 'index.html';
	}
);

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
	return this.slice(0, str.length) == str;
  };
}
