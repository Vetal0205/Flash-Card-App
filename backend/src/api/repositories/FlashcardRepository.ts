import Flashcard, { FlashcardCreationAttributes, FlashcardUpdateAttributes } from '../models/Flashcard';
import UserFlashcardProgress, { UserFlashcardProgressCreationAttributes, UserFlashcardProgressUpdateAttributes } from '../models/UserFlashcardProgress';
import { Op } from 'sequelize';

// Data access for Flashcard and UserFlashcardProgress models
// Called by: FlashcardService
// FR-31: create;
// FR-08: update;
// FR-03: duplicate;
// FR-11: flag;`
// FR-02: search by keyword

class FlashcardRepository {
    async findAllFlashcardsByCollection(collectionID: number): Promise<Flashcard[]> {
        return Flashcard.findAll({
            where: { collectionID },
            order: [['createdAt', 'ASC']],
        });
    }

    // isFlaggedDifficult is per-user (UserFlashcardProgress), so userID is required
    async findFlaggedByUserAndCollectionn(userID: number, collectionID: number): Promise<Flashcard[]> {
        return Flashcard.findAll({
            where: { collectionID },
            include: [
                {
                    model: UserFlashcardProgress,
                    where: { userID, isFlaggedDifficult: true },
                    required: true,
                },
            ],
            order: [['createdAt', 'ASC']],
        });
    }

    async searchFlashcardsByKeyword(collectionID: number, keyword: string): Promise<Flashcard[]> {
        return Flashcard.findAll({
            where: {
                collectionID,
                [Op.or]: [
                    { question: { [Op.iLike]: `%${keyword}%` } },
                    { answer: { [Op.iLike]: `%${keyword}%` } },
                ],
            },
            order: [['createdAt', 'ASC']],
        });
    }

    async findFlashcardById(id: number): Promise<Flashcard | null> {
        return Flashcard.findByPk(id);
    }

    async createFlashcard(data: FlashcardCreationAttributes): Promise<Flashcard> {
        return Flashcard.create(data);
    }

    async updateFlashcard(id: number, data: FlashcardUpdateAttributes): Promise<void> {
        await Flashcard.update(data, { where: { flashcardID: id } });
    }

    // Creates initial UserFlashcardProgress row when a user first encounters a flashcard
    async findOrCreateFlashcardProgress(data: UserFlashcardProgressCreationAttributes): Promise<UserFlashcardProgress> {
        const [progress] = await UserFlashcardProgress.findOrCreate({
            where: { userID: data.userID, flashcardID: data.flashcardID },
            defaults: data,
        });
        return progress;
    }

    async updateFlashcardProgress(userID: number, flashcardID: number, data: UserFlashcardProgressUpdateAttributes): Promise<void> {
        await UserFlashcardProgress.update(data, {
            where: { userID, flashcardID },
        });
    }

    async incrementFlashcardProgress(userID: number, flashcardID: number, field: 'knownCount' | 'unknownCount'): Promise<void> {
        await UserFlashcardProgress.increment(field, { by: 1, where: { userID, flashcardID } });
    }

    async deleteFlashcardById(id: number): Promise<void> {
        await Flashcard.destroy({ where: { flashcardID: id } });
    }
}

export default new FlashcardRepository();
