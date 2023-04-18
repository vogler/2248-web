import React from 'react'
import ReactDOM from 'react-dom/client'
import { Mantine } from './Mantine';
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Mantine>
      <App />
    </Mantine>
  </React.StrictMode>,
);
