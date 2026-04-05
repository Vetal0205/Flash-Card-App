import User from './User';
import Collection from './Collection';
import Flashcard from './Flashcard';
import StudySession from './StudySession';
import StudySessionCardOrder from './StudySessionCardOrder';
import StudySessionResponse from './StudySessionResponse';
import UserFlashcardProgress from './UserFlashcardProgress';
import UserSecurityStatus from './UserSecurityStatus';
import UserSettingsPreference from './UserSettingsPreferences';

// Define associations between models to use in Sequelize queries using "include" field.
// User
User.hasMany(Collection, { foreignKey: 'userID' });
User.hasMany(StudySession, { foreignKey: 'userID' });
User.hasMany(UserFlashcardProgress, { foreignKey: 'userID' });
User.hasOne(UserSecurityStatus, { foreignKey: 'userID' });
User.hasOne(UserSettingsPreference, { foreignKey: 'userID' });

// Collection
Collection.belongsTo(User, { foreignKey: 'userID' });
Collection.hasMany(Flashcard, { foreignKey: 'collectionID' });
Collection.hasMany(StudySession, { foreignKey: 'collectionID' });

// Flashcard
Flashcard.belongsTo(Collection, { foreignKey: 'collectionID' });
Flashcard.hasMany(UserFlashcardProgress, { foreignKey: 'flashcardID' });
Flashcard.hasMany(StudySessionCardOrder, { foreignKey: 'flashcardID' });
Flashcard.hasMany(StudySessionResponse, { foreignKey: 'flashcardID' });

// StudySession
StudySession.belongsTo(User, { foreignKey: 'userID' });
StudySession.belongsTo(Collection, { foreignKey: 'collectionID' });
StudySession.hasMany(StudySessionCardOrder, { foreignKey: 'sessionID' });
StudySession.hasMany(StudySessionResponse, { foreignKey: 'sessionID' });

// StudySessionCardOrder
StudySessionCardOrder.belongsTo(StudySession, { foreignKey: 'sessionID' });
StudySessionCardOrder.belongsTo(Flashcard, { foreignKey: 'flashcardID' });

// StudySessionResponse
StudySessionResponse.belongsTo(StudySession, { foreignKey: 'sessionID' });
StudySessionResponse.belongsTo(Flashcard, { foreignKey: 'flashcardID' });

// UserFlashcardProgress
UserFlashcardProgress.belongsTo(User, { foreignKey: 'userID' });
UserFlashcardProgress.belongsTo(Flashcard, { foreignKey: 'flashcardID' });

// UserSecurityStatus
UserSecurityStatus.belongsTo(User, { foreignKey: 'userID' });

// UserSettingsPreference
UserSettingsPreference.belongsTo(User, { foreignKey: 'userID' });

export {
    User,
    Collection,
    Flashcard,
    StudySession,
    StudySessionCardOrder,
    StudySessionResponse,
    UserFlashcardProgress,
    UserSecurityStatus,
    UserSettingsPreference,
};
