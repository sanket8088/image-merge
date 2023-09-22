// src/App.js
import React from 'react';
import './App.css';
import ImageUploader from './components/FileUploader/FileUploader';
import QuoteApp from './components/Draggable/Draggable';

function App() {
  return (
    <div className="App">
      <h1>Image Uploader</h1>
      {/* <ImageUploader /> */}
      <QuoteApp />
    </div>
  );
}

export default App;
