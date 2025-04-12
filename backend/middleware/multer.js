import multer from 'multer';

const storage = multer.memoryStorage(); // use memory for cloudinary uploads
const upload = multer({ storage });

export default upload;
