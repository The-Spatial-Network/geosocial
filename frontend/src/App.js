import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import MapsPage from './pages/MapsPage';
import MapDetailPage from './pages/MapDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Navigation />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/maps" 
            element={user ? <MapsPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/maps/:slug" 
            element={user ? <MapDetailPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <ProfilePage /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;