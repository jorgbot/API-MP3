

    const videoController = require('../controllers/videoController');

    module.exports = router=>{
    
        router.get('/get-videos',videoController.getVideos);
        router.get('/get-video-info/:id',videoController.getVideoInfo);
        router.get('/share-video/:id',videoController.shareVideo);
        router.get('/get-formats/:type/:id',videoController.getFormats);
        router.get('/download-format',videoController.downloadFormat);
        router.get('/to-mp3',videoController.toMP3);
        router.get('*',videoController.renderPage);
        
    };
    
    
    