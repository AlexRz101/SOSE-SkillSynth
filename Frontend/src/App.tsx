import './App.css';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
//import Body from './Body.tsx';
import HideableText from './HideableText.tsx';
import AutoCompleteText from './AutoCompleteText.tsx';

function App() {

  return (
    <>
      <Header/>
      <AutoCompleteText text='Array stuff'/>
      <Footer/>
    </>
  )
}

export default App
