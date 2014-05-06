package main;

import java.io.File;
import java.math.BigInteger;

import org.spongycastle.crypto.params.KeyParameter;

import net.Server;

import com.google.bitcoin.core.AbstractWalletEventListener;
import com.google.bitcoin.core.Address;
import com.google.bitcoin.core.ECKey;
import com.google.bitcoin.core.InsufficientMoneyException;
import com.google.bitcoin.core.NetworkParameters;
import com.google.bitcoin.core.Transaction;
import com.google.bitcoin.core.Utils;
import com.google.bitcoin.core.Wallet;
import com.google.bitcoin.core.Wallet.SendRequest;
import com.google.bitcoin.core.Wallet.SendResult;
import com.google.bitcoin.crypto.KeyCrypterException;
import com.google.bitcoin.kits.WalletAppKit;
import com.google.bitcoin.params.MainNetParams;
import com.google.bitcoin.utils.BriefLogFormatter;

import data.BitcoinAverage;

public class Main 
{
	public static WalletAppKit kit;
	public static Address mainAddress;
	public static Server server;
	public static NetworkParameters params;
	public static BitcoinAverage bitcoinAverage;

	public static void main(String[] args) throws InterruptedException 
	{
		// Start server thread
		server = new Server(19912);
		Thread serverThread = new Thread(server);
		serverThread.start();
	    
	    // Start BitcoinAverage worker
	    bitcoinAverage = new BitcoinAverage();
	    Thread bitcoinAverageThread = new Thread(bitcoinAverage);
	    bitcoinAverageThread.start();
		
		// Logger setup
		BriefLogFormatter.init();
		
		// Main network setup		
		params = MainNetParams.get();
		String filePrefix = "slick";
		
		// Start up wallet and ensure we have our first key.
		kit = new WalletAppKit(params, new File("."), filePrefix) 
		{
			@Override
		    protected void onSetupCompleted() 
		    {
		        if (wallet().getKeychainSize() < 1)
		        {
		            wallet().addKey(new ECKey());
		        }
		    }
		};
		
		// Set up Slick specific settings
		kit.setUserAgent("jslick", "1");
		
		// Download the block chain and wait until it is done
		kit.startAndWait();
				
		// Get main wallet address
		mainAddress = kit.wallet().getKeys().get(0).toAddress(params);
		System.out.println("Main address: "+mainAddress);
		
		kit.wallet().addEventListener(new AbstractWalletEventListener() 
		{
		    public void onCoinsReceived(Wallet w, Transaction tx, BigInteger prevBalance, BigInteger newBalance) 
		    {
		        
		    }
		});
		
		// Set server to ready
		server.ready = true;
		
	}
	
	public static String sendBitcoins(Address recipientAddress, BigInteger amountToSend, String password)
	{		
		BigInteger zero = new BigInteger("0");
		
		if (amountToSend.compareTo(zero)==0)
		{
			return "ERROR:::You can't send zero bitcoins!";
		}
		else if (amountToSend.compareTo(zero)==-1)
		{
			return "ERROR:::You can't send less than zero bitcoins!";
		}
		
		KeyParameter aesKey;
		
		try
		{
			aesKey = kit.wallet().getKeyCrypter().deriveKey(password);
		}
		catch (KeyCrypterException e)
		{
			return "ERROR:::Sorry, you've entered the wrong password.";
		}
		
		SendRequest sendRequest = Wallet.SendRequest.to(recipientAddress, amountToSend);
		sendRequest.aesKey = aesKey;
		sendRequest.feePerKb = Utils.toNanoCoins("0.0001");
		SendResult sendResult;
		
		try 
		{
			sendResult = kit.wallet().sendCoins(sendRequest);
		} 
		catch (InsufficientMoneyException e) 
		{			
			e.printStackTrace();
			return "ERROR:::You don't have enough bitcoins!";
		}
		catch (KeyCrypterException e)
		{
			return "ERROR:::Sorry, you've entered the wrong password.";
		}
		
		try 
		{
			sendResult.broadcastComplete.get();
		} 
		catch (Exception e) 
		{
			e.printStackTrace();
			return "ERROR:::Sorry, something went wrong! "+e.getMessage();
		}
				
		return "SUCCESS:::Your bitcoins have been sent!";
		
	}
	

}
