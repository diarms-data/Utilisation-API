import AlbumModel from '../models/album.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);

    this.run();
  }

  deleteById() {
    this.app.delete('/album/:id', (req, res) => {
      this.AlbumModel.findByIdAndDelete(req.params.id)
        .then((album) => {
          res.status(200).json(album || {});
        })
        .catch((err) => {
          console.error(`[ERROR] album/delete -> ${err}`);
          res.status(500).json({ code: 500, message: 'Internal Server error' });
        });
    });
  }

  showById() {
    this.app.get('/album/:id', (req, res) => {
      this.AlbumModel.findById(req.params.id)
        .populate('photos')
        .then((album) => {
          res.status(200).json(album || {});
        })
        .catch((err) => {
          console.error(`[ERROR] album/:id -> ${err}`);
          res.status(500).json({ code: 500, message: 'Internal Server error' });
        });
    });
  }

  create() {
    this.app.post('/album/', (req, res) => {
      const album = new this.AlbumModel(req.body);

      album.save()
        .then((savedAlbum) => {
          res.status(200).json(savedAlbum || {});
        })
        .catch((err) => {
          console.error(`[ERROR] album/create -> ${err}`);
          res.status(500).json({ code: 500, message: 'Internal Server error' });
        });
    });
  }

  updateById() {
    this.app.put('/album/:id', async (req, res) => {
      try {
        const updatedAlbum = await this.AlbumModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );
  
        if (!updatedAlbum) {
          return res.status(404).json({ code: 404, message: 'Album not found' });
        }
  
        res.status(200).json(updatedAlbum);
      } catch (err) {
        console.error(`[ERROR] PUT /album/:id -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad request' });
      }
    });
  }

  getAll() {
    this.app.get('/albums', async (req, res) => {
      try {
        const filter = {};
  
        if (req.query.title) {
          // Recherche insensible à la casse
          filter.title = { $regex: new RegExp(req.query.title, 'i') };
        }
  
        const albums = await this.AlbumModel.find(filter);
  
        res.status(200).json(albums);
      } catch (err) {
        console.error(`[ERROR] GET /albums -> ${err}`);
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error'
        });
      }
    });
  }
  
  

  run() {
    this.create();
    this.showById();
    this.deleteById();
    this.updateById();  
    this.getAll();   
  }
};

export default Albums;
