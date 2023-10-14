import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Home from './Home';

const App = () => {
  const client = JSON.parse(localStorage.getItem('client'))
  console.log(client);

  return (
  <BrowserRouter>
    <Box sx={{
      display: 'flex',
      backgroundColor: '#F5F5F5',
    }}>
      <Routes>
        <Route path="/" exact element={<Home />} />
      </Routes>
    </Box>
  </BrowserRouter>
  )
}

export default App