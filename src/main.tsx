import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppView } from './views/AppView';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppView />
  </React.StrictMode>
);
