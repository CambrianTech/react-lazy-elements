import React from 'react';
import './App.css';
import {LazyImage} from "react-lazy-elements";

const App: React.FC = () => {
  return (
    <div className="App">
      <LazyImage src={"logo192.png"}  />
    </div>
  );
}

export default App;
