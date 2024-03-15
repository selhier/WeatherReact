import React from 'react'
//import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'
// import App from './App.jsx'
import './style.css'
import sunny from './assets/sunny.gif'
import cloudy from './assets/cloudy.gif'
import rainy from './assets/rainy.gif'

function App() {
  // const root = ReactDOM.createRoot(document.getElementById('root'))
  const apiKey = '9fa0bd6b6465044fc809ee5d027bcc55';
  const [data, setData] = useState(null);
  const [city, setCity] = useState('');
  const [position, setPosition] = useState({ latitude: null, longitude: null });

  const weatherImage ={
    'Clear' : sunny,
    'Rain'  : rainy,
    'Clouds': cloudy,
  }

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async function (position) {
        const pos = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setPosition(pos);

        const response = await fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + pos.latitude + "&lon=" + pos.longitude + "&appid=" + apiKey + "&units=metric");
        const data = await response.json();
        setData(data);
      });
    } else {
      console.log("Geolocation is not available in your browser.");
    }
  }, []);

  const icon = data?.weather?.[0]?.icon || '';; // For instance "09d"
  function handleButtonClick(city) {
    // Aquí puedes procesar el valor del input y la API key
    // apiKey = 'YOUR_API_KEY';
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=metric';
    fetch(url)
      .then(response => response.json())
      .then((data) => setData(data))
      .then(data => console.log(data));
  }
  return (
    
    <div className='divPadre'>
      
      <div className='Divinput'>
        <p className='Pciudad'> Ciudad: <input type="text" className='InputCity' value={city} onChange={(e) => setCity(e.target.value)} /></p>
        <button className='Btn' onClick={() => handleButtonClick(city)}>Enviar
            <img src="./assets/cloud.svg" alt="" />
        </button>
      </div>
      <div className='Wrapper'>
      <div className='divInfo'>
        <ul>
          {data && (
            <div>
              <li>Ciudad: {data.name}</li>
              <li>Condición climática: {data.weather && data.weather[0].main}</li>
              <li>Temperatura: {data.main.temp}°C</li>
            </div>
          )}
        </ul>
        <div className='IconW'>
          {/* <img src={'http://openweathermap.org/img/w/' + icon + '.png'} height="70px" /> */}


        </div>



      </div>
      <div className="ImgBack">
        

      </div>
      </div>
     
    </div>
  );

}

export default App