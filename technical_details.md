# Slick Wallet - Technical Details

Slick Wallet is split into two main components. Start-up scripts are also included to start both of these components simultaneously.

* The GUI - nwslick, a node-webkit package
* The backend - jslick, powered by bitcoinj

These components are described in more detail below.

## GUI

nwslick, a node-webkit package that delivers the GUI and controls for all application functions.

### Styling

- Use Bootstrap - http://getbootstrap.com
- Make UI as simplistic as possible

## Backend

jslick, a Java program powered by bitcoinj is used to handle Bitcoin wallet and networking functions.

jslick opens a localhost bound server that accepts text commands such as:

	get_balance
    get_main_address

This is how to GUI communicates with the backend.