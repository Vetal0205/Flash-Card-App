import multer from 'multer';
import { MAX_FILE_SIZE } from '../../constants';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
});

export default upload;
