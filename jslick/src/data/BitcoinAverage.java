package data;

import java.util.HashMap;

import org.json.simple.JSONObject;

public class BitcoinAverage implements Runnable
{
	private HashMap<String, Double> values = new HashMap<String, Double>();
	
	public void run()
	{
		updateValue("GBP");
		updateValue("USD");
		updateValue("EUR");
		
		try 
		{
			Thread.sleep(5*60*1000);
		} 
		catch (InterruptedException e) 
		{
			e.printStackTrace();
			System.exit(1);
		}
	}
	
	public Double getValue(String currency)
	{
		currency = currency.toUpperCase();
		
		if (values.containsKey(currency))
		{
			return values.get(currency);
		}
		else
		{
			return 0.00;
		}
	}
	
	public void updateValue(String currency)
	{
		currency = currency.toUpperCase();
		
		URLReader urlReader = new URLReader("https://api.bitcoinaverage.com/ticker/global/"+currency+"/");
		
		JSONObject jsonObj = urlReader.readJSON();
		
		if (jsonObj!=null)
		{
			try
			{
				values.put(currency, Double.parseDouble(jsonObj.get("24h_avg").toString()));
			}
			catch (NumberFormatException e)
			{
				
			}
		}
	}
}
