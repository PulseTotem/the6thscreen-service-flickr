/**
 * @author  Simon Urli <simon@the6thscreen.fr>
 */


/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/PictureAlbum.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/Picture.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/PictureURL.ts" />
/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />

class LastPicturesFromSearch extends SourceItf {

	constructor(params : any, flickrNamespaceManager : FlickrNamespaceManager) {
		super(params, flickrNamespaceManager);

		if (this.checkParams(["Limit","InfoDuration","oauthKey","SearchQuery"])) {
			this.run();
		}
	}

	public run() {
		var self = this;

		var fail = function(error) {
			if(error) {
				Logger.error(error);
			}
		};

		var success = function(oauthActions) {
			var successSearch = function (information) {

				var pictureAlbum : PictureAlbum = new PictureAlbum();
				var result = information.photos;
				var listPhotos = result.photo;

				pictureAlbum.setId(uuid.v1());
				pictureAlbum.setPriority(0);
				pictureAlbum.setDurationToDisplay(parseInt(self.getParams().InfoDuration) * listPhotos.length);

				for (var i = 0; i < listPhotos.length; i++) {
					var photo = listPhotos[i];

					var pic : Picture = new Picture(photo.id, 0, new Date(photo.dateupload), null, parseInt(self.getParams().InfoDuration));
					pic.setDescription(photo.description._content);
					pic.setTitle(photo.title);

					if(photo.url_o) {
						var original = new PictureURL(photo.id + "_original");
						original.setURL(photo.url_o);
						original.setHeight(photo.height_o);
						original.setWidth(photo.width_o);

						pic.setOriginal(original);
					}
					if(photo.url_n) {
						var small = new PictureURL(photo.id + "_small");
						small.setURL(photo.url_n);
						small.setHeight(photo.height_n);
						small.setWidth(photo.width_n);

						pic.setSmall(small);
					}

					if(photo.url_m) {
						var medium = new PictureURL(photo.id + "_medium");
						medium.setURL(photo.url_m);
						medium.setHeight(photo.height_m);
						medium.setWidth(photo.width_m);

						pic.setMedium(medium);
					}

					if(photo.url_l) {
						var large = new PictureURL(photo.id + "_large");
						large.setURL(photo.url_l);
						large.setHeight(photo.height_l);
						large.setWidth(photo.width_l);

						pic.setLarge(large);
					}

					if(photo.url_t) {
						var thumb = new PictureURL(photo.id + "_thumb");
						thumb.setURL(photo.url_t);
						thumb.setHeight(photo.height_t);
						thumb.setWidth(photo.width_t);

						pic.setThumb(thumb);
					}


					if(photo.owner && photo.ownername) {
						var owner : User = new User(photo.owner.toString(), 0, new Date(), new Date());
						if(photo.pathalias) {
							owner.setUsername(photo.pathalias);
						}
						owner.setRealname(photo.ownername);

						pic.setOwner(owner);
					}

					if(photo.tags) {
						var tagsArray = photo.tags.split(" ");
						tagsArray.forEach(function(tagName) {
							var tag : Tag = new Tag(uuid.v1(), 0, new Date(), new Date());
							tag.setName(tagName);

							pic.addTag(tag);
						});
					}

					pictureAlbum.addPicture(pic);
				}

				Logger.debug("Send PictureAlbum to client : ");
				Logger.debug(util.inspect(pictureAlbum));

				self.getSourceNamespaceManager().sendNewInfoToClient(pictureAlbum);
			};


			var searchUrl = '/services/rest/?method=flickr.photos.search&text='+self.getParams().SearchQuery+'&per_page='+self.getParams().Limit+'&format=json&nojsoncallback=1&content_type=1&extras=description,license,date_upload,date_taken,owner_name,icon_server,original_format,last_update,geo,tags,machine_tags,o_dims,views,media,path_alias,url_sq,url_t,url_s,url_q,url_m,url_n,url_z,url_c,url_l,url_o';
			oauthActions.get(searchUrl, successSearch, fail);
		};

		self.getSourceNamespaceManager().manageOAuth('flickr', self.getParams().oauthKey, success, fail);
	}
}