import React, {useMemo} from 'react';
import './App.css';
import {LazyImage} from "react-lazy-elements";

const App: React.FC = () => {

    const imageList = useMemo(() => {
        const images = []

        for (let i = 0; i < 200; i++) {
            images.push({key:`image-${i}`, src:"cat.jpg"})
        }

        return images
    }, []);

    return (
    <div className="App">
        {imageList.map(image =>
            <div key={image.key}>
                <LazyImage maintainSize src={image.src}  />
            </div>
        )}
    </div>
  );
}

export default App;
