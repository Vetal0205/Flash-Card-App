import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MockPage from './pages/MockPage';
import EditProfile from './pages/EditProfile';
import DifficultFlashcards from './pages/DifficultFlashcards';
import CollectionsDashboard from './pages/CollectionsDashboard';
import FlashcardList from './pages/FlashcardList';
import StudyMode from './pages/StudyMode';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mock" element={<MockPage />} />
        <Route path="/collections" element={<CollectionsDashboard />} />
        <Route path="/collections/:collectionId" element={<FlashcardList />} />
        <Route path="/collections/:collectionId/study" element={<StudyMode />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/difficult-flashcards" element={<DifficultFlashcards />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;