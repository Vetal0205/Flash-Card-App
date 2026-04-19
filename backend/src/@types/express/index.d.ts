import { UserOutput } from '../../api/models/User';
import Collection from '../../api/models/Collection';
import StudySession from '../../api/models/StudySession';

declare global {
    namespace Express {
        interface Request {
            userdata?: UserOutput;
            collection?: Collection;
            studySession?: StudySession;
            file?: Multer.File;
        }
    }
}
