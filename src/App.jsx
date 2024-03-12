import React from 'react'
//import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'
// import App from './App.jsx'
import './style.css'

function App() {
  // const root = ReactDOM.createRoot(document.getElementById('root'))
//   const apiKey = '9fa0bd6b6465044fc809ee5d027bcc55';
const [data, setData] = useState(null);
useEffect(() => {
  fetch("https://api.openweathermap.org/data/2.5/weather?q=Haiti&lang=sp&appid=9fa0bd6b6465044fc809ee5d027bcc55&units=metric")
  .then((response)=> response.json())
  .then((data) => setData(data));
  
},[])
const icon = data.weather[0].icon; // For instance "09d"

return(
    <div className='divPadre'>
        
        <div className='Divinput'>
        <p className='Pciudad'> Ciudad: <input className='InputCity' placeholder='Ciudad' type="text" /></p>
        <button className='Btn'>Buscar</button>
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
        <img src={'http://openweathermap.org/img/w/'+ icon + ".png"} height="70px" />
        </div>
      </div>
    </div>
  );

}

export default App