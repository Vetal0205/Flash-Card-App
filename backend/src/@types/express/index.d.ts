import { UserOutput } from '../../api/models/User';
import Collection from '../../api/models/Collection';

declare global {
    namespace Express {
        interface Request {
            userdata?: UserOutput;
            collection?: Collection;
            file?: Multer.File;
        }
    }
}
