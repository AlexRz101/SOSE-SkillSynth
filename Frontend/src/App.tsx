import './App.css';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
//import Body from './Body.tsx';
import HideableText from './HideableText.tsx';

function App() {

  return (
    <>
      <Header/>
      <HideableText text=" "/>
      <Footer/>
    </>
  )
}

export default App
