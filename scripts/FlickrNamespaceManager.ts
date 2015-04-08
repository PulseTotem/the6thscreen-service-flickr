/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */

/// <reference path="../libsdef/datejs.d.ts" />
/// <reference path="../t6s-core/core-backend/libsdef/node-uuid.d.ts" />

/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />

/// <reference path="../t6s-core/core-backend/scripts/server/SourceNamespaceManager.ts" />

/// <reference path="../t6s-core/core-backend/t6s-core/core/scripts/infotype/PictureAlbum.ts" />
/// <reference path="../t6s-core/core-backend/t6s-core/core/scripts/infotype/Picture.ts" />

var datejs : any = require('datejs');

var DateJS : any = <any>Date;
var uuid : any = require('node-uuid');

var util = require('util');

class FlickrNamespaceManager extends SourceNamespaceManager {

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {any} socket - The socket.
	 */
	constructor(socket : any) {
		super(socket);
		this.addListenerToSocket('LastPicturesFromSearch', this.retrieveLastPicturesFromSearch);
	}

	retrieveLastPicturesFromSearch(params : any) {
		var self = this;

		Logger.debug("LastPicturesFromSearch Action with params :");
		Logger.debug(params);

		var fail = function(error) {
			if(error) {
				Logger.error(error);
			}
		};

		var success = function(oauthActions) {
			var successSearch = function (result) {
				var pictureAlbum : PictureAlbum = new PictureAlbum();
				var listPhotos = result.photo;

				pictureAlbum.setId(uuid.v1());
				pictureAlbum.setPriority(0);

				for (var photo in listPhotos) {
					var pic : Picture = new Picture();

				}

				Logger.debug("Send PictureAlbum to client : ");
				Logger.debug(pictureAlbum);

				self.sendNewInfoToClient(pictureAlbum);
			};


			var searchUrl = '?method=flickr.photos.search&text='+params.SearchQuery+'&per_page='+params.Limit+'&format=json&nojsoncallback=1&extras=description,license,date_upload,date_taken,owner_name,icon_server,original_format,last_update,geo,tags,machine_tags,o_dims,views,media,path_alias,url_sq,url_t,url_s,url_q,url_m,url_n,url_z,url_c,url_l,url_o';
			oauthActions.get(searchUrl, successSearch, fail);
		};

		self.manageOAuth('flickr', params.oauthKey, success, fail);
	}
}