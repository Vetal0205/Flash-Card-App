import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MockPage from './pages/MockPage';
import AppearanceSettingsPage from './pages/AppearanceSettingsPage';
import ImportFlashcardsPage from './pages/ImportFlashcardsPage';
import ExportCollectionPage from './pages/ExportCollectionPage';
import CollectionsDashboard from './pages/CollectionsDashboard';
import FlashcardList from './pages/FlashcardList';
import StudyMode from './pages/StudyMode';
import EditProfile from './pages/EditProfile';
import DifficultFlashcards from './pages/DifficultFlashcards';
import { ThemeProvider } from './components/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mock" element={<MockPage />} />
          <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
          <Route path="/collections" element={<CollectionsDashboard />} />
          <Route path="/collections/:collectionId" element={<FlashcardList />} />
          <Route path="/collections/:collectionId/study" element={<StudyMode />} />
          <Route
            path="/collections/:collectionId/import-flashcards"
            element={<ImportFlashcardsPage />}
          />
          <Route
            path="/collections/:collectionId/export-collection"
            element={<ExportCollectionPage />}
          />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/difficult-flashcards" element={<DifficultFlashcards />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
