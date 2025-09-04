import React from 'react';
import ReactDOM from 'react-dom';
import { BookmarkProvider } from '../context/BookmarkContext';
import Popup from './Popup';

ReactDOM.render(
  <BookmarkProvider>
    <Popup />
  </BookmarkProvider>, 
  document.getElementById('popup-root')
);
