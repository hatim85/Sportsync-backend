import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'D:/MERN/SportSync/client/public')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

// const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

export default upload;