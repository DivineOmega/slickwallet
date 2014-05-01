package data;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class URLReader 
{
	private URL url;
	
	public URLReader(String url)
	{
		try 
		{
			this.url = new URL(url);
		}
		catch (MalformedURLException e) 
		{
			e.printStackTrace();
			System.exit(1);
		}
	}
	
	public String read()
	{
		String input = "";
		String inputLine;
		
        try
        {
        	BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));

			while ((inputLine = in.readLine()) != null)
			{
				input += inputLine+"\n";
			}
			
			in.close();
		} 
        catch (IOException e) 
        {
			e.printStackTrace();
			return null;
		}
        
		return input;
	}
	
	public JSONObject readJSON()
	{
		String jsonText = read();
		
		JSONParser parser = new JSONParser();
        
		try
		{
			return (JSONObject) parser.parse(jsonText);
		}
		catch(ParseException e)
		{
			e.printStackTrace();
			return null;
		}
	}
}
