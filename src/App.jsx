import React from 'react'
//import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'
// import App from './App.jsx'
import './style.css'
import backimage from './assets/giphy.gif'

function App() {
  // const root = ReactDOM.createRoot(document.getElementById('root'))
const apiKey = '9fa0bd6b6465044fc809ee5d027bcc55';
const [data, setData] = useState(null);
const [city, setCity] = useState('');
// useEffect(() => {
//   fetch("https://api.openweathermap.org/data/2.5/weather?q=chile&lang=sp&appid=9fa0bd6b6465044fc809ee5d027bcc55&units=metric")
//   .then((response)=> response.json())
//   .then((data) => setData(data));
  
// },[])
 const icon = data?.weather?.[0]?.icon || '';; // For instance "09d"
 function handleButtonClick(city) {
  // Aquí puedes procesar el valor del input y la API key
  // apiKey = 'YOUR_API_KEY';
  const url = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&appid='+apiKey+'&units=metric';
  fetch(url)
    .then(response => response.json())
    .then((data) => setData(data))
    .then(data => console.log(data));
}
return(
    <div className='divPadre'>
        <div className='Divinput'>
        <p className='Pciudad'> Ciudad: <input type="text" value={city} onChange={(e) => setCity(e.target.value)} /></p>
        <button className='btn' onClick={() => handleButtonClick(city)}>Enviar</button>
        </div>
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
        <img src={'http://openweathermap.org/img/w/'+ icon +'.png'} height="70px" />
        <div className='ImgBack'>
        <img className='' src={backimage} alt="" />
        </div>
        
        </div>
        
            
        
      </div>
     
    </div>
  );

}

export default App