package net;

import java.io.IOException;
import java.net.Inet4Address;
import java.net.ServerSocket;
import java.net.Socket;

public class Server implements Runnable
{
	public boolean ready;
	private int portNumber;

	public Server(int portNumber)
	{
		this.portNumber = portNumber;
	}
	
	public void run()
	{
		ServerSocket serverSocket = null;
		try 
		{
			serverSocket = new ServerSocket(portNumber, 0, Inet4Address.getByName("localhost"));
			
			ServerConnection serverConnection;
			while(true)
			{
				Socket socket = serverSocket.accept();
				
				serverConnection = new ServerConnection(socket);
				Thread t = new Thread(serverConnection);
			    t.start();
			}
			
		} 
		catch (IOException e) 
		{
			e.printStackTrace();
			System.exit(1);
		}
	}
	
}
