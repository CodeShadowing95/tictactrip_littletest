import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';

const App = () => {
  // const client = JSON.parse(localStorage.getItem('client'))
  // console.log(client);

  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" exact element={<Home />} />
    </Routes>
  </BrowserRouter>
  )
}

export default App