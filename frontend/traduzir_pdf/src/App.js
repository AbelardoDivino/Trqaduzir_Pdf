import './App.css';
import Navbar from './components/home/Navbar';
import Paginadospdf from './components/Paginadospdf';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login'
function App() {
  return (
    <div className="App">

    <AuthProvider>
     <Navbar></Navbar>
     <Paginadospdf></Paginadospdf>
     <Login></Login>
    </AuthProvider>

    </div>
  );
}

export default App;
