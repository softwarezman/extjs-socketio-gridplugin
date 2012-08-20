/**
 * Plugin to add SocketIO capabilities to any grid. Supports multiple stores per grid.
 */
Ext.define('Ext.ux.GridSocketIO', {
	extend: 'Ext.AbstractPlugin',
	requires: 'Ext.ux.SocketIO',
	alias: 'plugin.gridsocketio',
	
	config: {
		/**
		 * @cfg (String) dynamic
		 * Defaults to localhost but should be set to the server you are connecting to
		 * @accessor
		 */
		serverHost: 'localhost',
		
		/**
		 * @cfg (String) dynamic
		 * Insert port here so Socket.io knows where to go looking
		 * @accessor
		 */
		serverPort: 80,
		
		/**
		 * @cfg (Boolean) dynamic
		 * True to have the socket load the data initially (untested since I don't use it!)
		 * @accessor
		 */
		doInitialLoad: false,
		
		/**
		 * @cfg (Array[String] OR Array[Object]) dynamic
		 * Array of Strings should look like: ['Events']
		 * Array of Objects designating the store types that should be looked for and added
		 * Objects in the array should look like: 
		 * {storeProperty: 'eventStore', storeId: 'Events'}
		 */
		storeTypes: [],
		
		/**
		 * @cfg (Object) dynamic
		 * Parent grid if there is an issue with sub-grids being called first
		 */
		ownerGrid: null,
		
		/**
	     * An empty function by default, but provided so that you can perform custom
	     * record validations before they are added to the store.
	     * This function is passed through to the websocket class
	     * @param {String} Type of event that is calling the function (update, add, remove)
	     * @param {Ext.data.Model} The model that needs to be validated
	     * @method validateRecords
	     */
	    validateRecords: Ext.emptyFn,
	    
	    /**
	     * What the connection should do if the validation fails.
	     * Defaults to '' which means it leaves the record alone.
	     * Other supported option is 'remove' which will remove the record completely from the store
	     */
	    validationFailureAction: '',
	},
	
	/**
	 * The gridpanel that is used for manipulating data
	 * @param {Ext.grid.Panel} grid
	 */
	init: function(grid) {
		var me = this,
			store;
			
		if (me.ownerGrid) {
			grid = me.ownerGrid;
		}
		
		grid.socket = Ext.create('Ext.ux.SocketIO', me) ;
		grid.socket.owner = grid;
		
		grid.relayEvents(grid.socket, ['socketconnect', 'socketdisconnect']);
		
		
		/**
		 * If your grid ties to more than one store you would add add/update/remove events
		 * to each store with the storeType set to the name of your store.
		 */ 
		if(me.storeTypes.length === 0) {
			store = me.getStoreByType('', grid);
			this.addListeners(grid, store, grid.store.storeId);
		} else {
			for(var i = 0; i < me.storeTypes.length; i++) {
				store = me.getStoreByType(me.storeTypes[i], grid);
				this.addListeners(grid, store, me.storeTypes[i]);
			}
		}
	},
	
	/**
	 * 
	 * @param {Ext.grid.Panel} grid The grid to access it's socket connection
	 * @param {Ext.data.Store} store The store to add event listeners and fire events
	 * @param {String} storeType The store type that you are adding the listeners to.
	 */
	addListeners: function(grid, store, storeType) {
		grid.socket.socket.on('connect', function() {
			store.fireEvent('socketConnect', store);
		});
		grid.socket.socket.on('disconnect', function() {
			store.fireEvent('socketDisconnect', store);
		});
		store.on('write', grid.socket.doAdd, grid.socket, {storeType: storeType});
		store.on('update', grid.socket.doUpdate, grid.socket, {storeType: storeType});
        store.on('remove', grid.socket.doRemove, grid.socket, {storeType: storeType});
	},
	
	/** 
    * Select try and find the right store, either by storeId or storeType
    * @param {String} storeType The storeType (usually storeId)
    * @param {Ext.grid.Panel} grid The Grid who's store you are trying to find
    */
    getStoreByType: function(storeType, grid){
		var storeId = grid.getStore().storeId;
		
		if(storeType === '' || storeType == storeId) {
			return grid.getStore();
		} 
		
		if(storeId != storeType.storeId && this.ownerGrid) {
			//Try and look in the ownerCt for the store!
			if(this.ownerGrid[storeType.storeProperty]) {
				return this.ownerGrid[storeType.storeProperty];
			}
		} else {
			return grid.getStore();	
		}
		
        return null;          
    }
});
