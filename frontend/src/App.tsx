import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MockPage from './pages/MockPage';
import EditProfile from './pages/EditProfile';
import DifficultFlashcards from './pages/DifficultFlashcards';
import CollectionsDashboard from './pages/CollectionsDashboard';
import FlashcardList from './pages/FlashcardList';
import StudyMode from './pages/StudyMode';
import PublicSharedCollection from './pages/PublicSharedCollection';
import { ThemeProvider } from './components/ThemeContext';
import DarkModeToggle from './components/DarkModeToggle';

function AppRoutes() {
  const location = useLocation();
  const hideFloatingChrome = location.pathname.startsWith('/share/');

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem('minddeck_token')
              ? <Navigate to="/collections" replace />
              : <Login />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/mock" element={<MockPage />} />
        <Route path="/share/:collectionId" element={<PublicSharedCollection />} />
        <Route path="/collections" element={<CollectionsDashboard />} />
        <Route path="/collections/:collectionId" element={<FlashcardList />} />
        <Route path="/collections/:collectionId/study" element={<StudyMode />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/difficult-flashcards" element={<DifficultFlashcards />} />
      </Routes>
      {!hideFloatingChrome && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#ffffff',
          border: '1px solid #e0ddd6',
          borderRadius: '12px',
          padding: '8px 12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}>
          <DarkModeToggle variant="compact" showLabel={false} />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;