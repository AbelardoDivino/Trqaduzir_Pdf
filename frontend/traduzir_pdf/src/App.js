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

function App() {
  return (
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
  );
}

export default App;
