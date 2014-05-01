package net;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.math.BigInteger;
import java.net.Socket;
import java.util.List;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.StringUtils;

import main.Main;

import com.google.bitcoin.core.Address;
import com.google.bitcoin.core.AddressFormatException;
import com.google.bitcoin.core.Transaction;
import com.google.bitcoin.core.Wallet.BalanceType;

public class ServerConnection implements Runnable
{
	Socket socket;
	
	public ServerConnection(Socket socket)
	{
		this.socket = socket;
	}
	
	public void run()
	{
		
		try
		{
			socket.setSoTimeout(10000);
			
			BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			PrintWriter out = new PrintWriter(socket.getOutputStream());
			
			out.print("jslick:");
			out.flush();
			
			String command = in.readLine();
			
			//System.out.println("Got command: "+command);
			
			if (command.equalsIgnoreCase("shutdown"))
			{
				System.exit(0);
			}
			else if (Main.server.ready==false)
			{
				out.print("not_ready");
			}
			else if(command.toLowerCase().startsWith("set_password"))
			{
				String password = command.substring("set_password ".length()-1);
				password = base64decode(password);
				
				try
				{
					Main.kit.wallet().encrypt(password);
					out.print("password_set"); 
				}
				catch (IllegalStateException e)
				{
					out.print(e.getMessage());
				}
			}
			else if(Main.kit.wallet().isEncrypted()==false)
			{
				out.print("not_encrypted");
			}
			else if (command.equalsIgnoreCase("get_available_balance"))
			{
				out.print(Main.kit.wallet().getBalance(BalanceType.AVAILABLE));
			}
			else if (command.equalsIgnoreCase("get_estimated_balance"))
			{
				out.print(Main.kit.wallet().getBalance(BalanceType.ESTIMATED));
			}
			else if(command.equalsIgnoreCase("get_main_address"))
			{
				out.print(Main.mainAddress.toString());
			}
			else if(command.toLowerCase().startsWith("send_bitcoins"))
			{
				String[] commandParts = command.split(" ");
				
				Address recipient = null;
				try 
				{
					recipient = new Address(Main.params, commandParts[1]);
					BigInteger amount = new BigInteger(commandParts[2]);
					String password = commandParts[3];
					password = base64decode(password);
					
					String result = Main.sendBitcoins(recipient, amount, password);
					
					out.print(result);
				} 
				catch (NumberFormatException e)
				{
					out.print("ERROR:::You need to enter the number of bitcoins to send!");
					e.printStackTrace();
				}
				catch (AddressFormatException e) 
				{
					out.print("ERROR:::The Bitcoin address you entered is not right!");
					e.printStackTrace();
				}
				
			}
			else if(command.equalsIgnoreCase("get_transactions"))
			{
				List<Transaction> transactions = Main.kit.wallet().getRecentTransactions(0, false); // 0 = all transactions
				
				for (Transaction tx : transactions) 
				{
					out.print(tx.getUpdateTime());
					out.print(":::");
					out.print(tx.getValue(Main.kit.wallet()));
					out.print("\r\n");
				}
			}
			else if(command.equalsIgnoreCase("ping"))
			{
				out.print("pong");
			}
			else
			{
				out.print("invalid_command");
			}
			
			out.flush();
						
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
		finally
		{
			if (!socket.isClosed())
			{
				try 
				{
					socket.close();
				} 
				catch (IOException e) 
				{
					e.printStackTrace();
				}
			}
		}
		
		
	}
	
	public String base64decode(String s) {
	    return StringUtils.newStringUtf8(Base64.decodeBase64(s));
	}
	public String base64encode(String s) {
	    return Base64.encodeBase64String(StringUtils.getBytesUtf8(s));
	}
	
}
