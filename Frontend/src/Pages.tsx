import './App.css';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
//import Body from './Body.tsx';
import SignIn from './components/SignIn.tsx';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from './components/navBar.tsx';

function Pages() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/main" element={<NavBar />} />
        </Routes>
        <Footer />
    </BrowserRouter>
  );
}

export default Pages
