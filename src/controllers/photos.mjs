import PhotoModel from '../models/photo.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);

    this.run();
  }

  showFromAlbum() {
    this.app.get('/album/:idAlbum/photo/:idPhoto', async (req, res) => {
      try {
        const { idAlbum, idPhoto } = req.params;
  
        const photo = await this.PhotoModel.findOne({
          _id: idPhoto,
          album: idAlbum
        });
  
        if (!photo) {
          return res.status(404).json({ code: 404, message: 'Photo not found in this album' });
        }
  
        res.status(200).json(photo);
      } catch (err) {
        console.error(`[ERROR] GET /album/${idAlbum}/photo/${idPhoto} -> ${err}`);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }
  
  
  createInAlbum() {
    this.app.post('/album/:albumId/photo', async (req, res) => {
      try {
        const albumId = req.params.albumId;
  
        // Créer la photo liée à l'album
        const photo = new this.PhotoModel({
          ...req.body,
          album: albumId
        });
  
        const savedPhoto = await photo.save();
  
        // Ajouter la référence de la photo dans l'album
        const AlbumModel = this.PhotoModel.db.model('Album');
        await AlbumModel.findByIdAndUpdate(albumId, {
          $push: { photos: savedPhoto._id }
        });
  
        res.status(201).json(savedPhoto);
      } catch (err) {
        console.error(`[ERROR] POST /album/${req.params.albumId}/photo -> ${err}`);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  deleteFromAlbum() {
    this.app.delete('/album/:albumId/photo/:photoId', async (req, res) => {
      try {
        const { albumId, photoId } = req.params;
  
        // Supprimer la photo uniquement si elle appartient à cet album
        const deletedPhoto = await this.PhotoModel.findOneAndDelete({
          _id: photoId,
          album: albumId
        });
  
        if (!deletedPhoto) {
          return res.status(404).json({ code: 404, message: 'Photo not found in this album' });
        }
  
        const AlbumModel = this.PhotoModel.db.model('Album');
        await AlbumModel.findByIdAndUpdate(albumId, {
          $pull: { photos: photoId }
        });
  
        res.status(200).json(deletedPhoto);
      } catch (err) {
        console.error(`[ERROR] DELETE /album/${albumId}/photo/${photoId} -> ${err}`);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }
  
  updateInAlbum() {
    this.app.put('/album/:idAlbum/photo/:idPhoto', async (req, res) => {
      try {
        const { idAlbum, idPhoto } = req.params;
  
        // Vérifie si la photo existe et appartient bien à l'album
        const existingPhoto = await this.PhotoModel.findOne({
          _id: idPhoto,
          album: idAlbum
        });
  
        if (!existingPhoto) {
          return res.status(404).json({ code: 404, message: 'Photo not found in this album' });
        }
  
        // Mettre à jour les champs passés dans le body
        Object.assign(existingPhoto, req.body);
  
        const updatedPhoto = await existingPhoto.save();
        res.status(200).json(updatedPhoto);
      } catch (err) {
        console.error(`[ERROR] PUT /album/${req.params.idAlbum}/photo/${req.params.idPhoto} -> ${err}`);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }
  
  

  run() {
    this.showFromAlbum();
    this.createInAlbum();
    this.deleteFromAlbum();
    this.updateInAlbum();
  }
};

export default Photos;
