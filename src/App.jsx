import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faCloudRain, faSnowflake, faBolt, faSmog, faCloudShowersHeavy, faThermometerHalf, faTint, faWind } from '@fortawesome/free-solid-svg-icons';
import AsyncSelect from 'react-select/async';
import './style.css';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const locationData = await response.json();
        const cityName = locationData.address.city || locationData.address.town || locationData.address.village;
        setCity(cityName);
        fetchWeatherData(cityName);
      });
    }
  }, []);

  const fetchWeatherData = async (city) => {
    try {
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=9fa0bd6b6465044fc809ee5d027bcc55&units=metric`);
      const weatherData = await weatherResponse.json();
      console.log('Weather data:', weatherData); // Mensaje de depuración
      setData(weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const loadOptions = async (inputValue) => {
    console.log('Input value:', inputValue); // Mensaje de depuración
    if (inputValue.length > 2) {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${inputValue}&appid=9fa0bd6b6465044fc809ee5d027bcc55&units=metric`);
        const citiesData = await response.json();
        console.log('Cities data:', citiesData); // Mensaje de depuración
        return citiesData.list.map(city => ({
          label: city.name,
          value: city.name
        }));
      } catch (error) {
        console.error('Error fetching city data:', error);
        return [];
      }
    }
    return [];
  };

  const handleCityChange = (selectedOption) => {
    setCity(selectedOption.value);
    fetchWeatherData(selectedOption.value);
  };

  const getWeatherIcon = (weather) => {
    switch (weather) {
      case 'Clear':
        return faSun;
      case 'Rain':
        return faCloudShowersHeavy;
      case 'Clouds':
        return faCloud;
      case 'Snow':
        return faSnowflake;
      case 'Thunderstorm':
        return faBolt;
      case 'Drizzle':
        return faCloudRain;
      case 'Mist':
        return faSmog;
      default:
        return faSun;
    }
  };

  return (
    <div className={`divPadre weatherBackground ${data ? data.weather[0].main : ''}`}>
      <div className="divInfo">
        <h2>{city}</h2>
        {data && <FontAwesomeIcon icon={getWeatherIcon(data.weather[0].main)} size="4x" className="weather-icon" />}
        <div className="Divinput">
          <AsyncSelect
            cacheOptions
            loadOptions={loadOptions}
            onChange={handleCityChange}
            placeholder="Enter city"
            noOptionsMessage={() => 'No options available'}
          />
        </div>
        {data && (
          <ul className="weatherInfo">
            <li><FontAwesomeIcon icon={faThermometerHalf} className="weather-icon" /> Temperatura: {data.main.temp}°C</li>
            <li><FontAwesomeIcon icon={faTint} className="weather-icon" /> Humedad: {data.main.humidity}%</li>
            <li><FontAwesomeIcon icon={faWind} className="weather-icon" /> Viento: {data.wind.speed} m/s</li>
            <li><FontAwesomeIcon icon={getWeatherIcon(data.weather[0].main)} className="weather-icon" /> Condición: {data.weather[0].description}</li>
          </ul>
        )}
      </div>
      <div className="ImgBack"></div>
    </div>
  );
}

export default App;