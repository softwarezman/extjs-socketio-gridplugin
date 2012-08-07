#extjs-socketio-gridplugin Grid plugin to support Socket.io operations#

ExtJS 4 grid plugin that allows for Create/Update/Delete changes to data to be propagated via the Socket.io helper code

Originally based on the [Bryntum Scheduler Socket.io/node.js example](http://bryntum.com/blog/nodejs-ext-scheduler-realtime-updates/)

## Requires ##
* ExtJS Socket.io extension (used to push/receive events from node.js or whatever backend you may be using) [ExtJS-SocketIO](https://github.com/softwarezman/extjs-socketio)

## Usage ##
* Under your grid configuration add: ```plugins: Ext.create('Ext.ux.GridSocketIO', {serverHost: 'yourservername', serverPort: 80})```
* You can add multiple stores as well if necessary (for the Bryntum Scheduler application)

## How it works ##
* It interfaces with the [Socket.io extension](https://github.com/softwarezman/extjs-socketio)
* It then listens for store events (write/update/remove) uses the socket.io extensio to push/listen to events recieved from the node.js (or whatever socket.io protocol compatible backend you are using) and processes the records for update/remove/add types.

## Features ##
* Adds a few events to the store: mainly socketDisconnect and socketConnect events right now