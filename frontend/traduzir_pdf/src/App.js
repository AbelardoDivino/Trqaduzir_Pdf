import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/home/Navbar';
import Home from './components/home/Home';
import Login from './components/Login';
import Cadastrar from './components/Cadastrar';
import Paginadospdf from './components/Paginadospdf';
import Campousu from './components/Campousu';
import Campoadmin from './components/Campoadmin';
import { AuthProvider } from './context/AuthContext';
import {GoogleOAuthProvider} from '@react-oauth/google'

function App() {
  return (
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}> 
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastrar" element={<Cadastrar />} />
            <Route path="/traduzir" element={<Paginadospdf />} />
            <Route path="/painel" element={<Campousu />} />
            <Route path="/admin" element={<Campoadmin />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
