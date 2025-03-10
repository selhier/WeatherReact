import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faCloud,
  faCloudRain,
  faSnowflake,
  faBolt,
  faSmog,
  faCloudShowersHeavy,
  faThermometerHalf,
  faTint,
  faWind
} from '@fortawesome/free-solid-svg-icons';
import AsyncSelect from 'react-select/async';
import './style.css';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);

  // Obtener la ubicación actual y la ciudad por geolocalización
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const locationData = await response.json();
        const cityName =
          locationData.address.city ||
          locationData.address.town ||
          locationData.address.village;
        setCity(cityName);
        fetchWeatherData(cityName);
      });
    }
  }, []);

  // Función para obtener datos del clima
  const fetchWeatherData = async (city) => {
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=9fa0bd6b6465044fc809ee5d027bcc55&units=metric`
      );
      const weatherData = await weatherResponse.json();
      setData(weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Función para cargar opciones de ciudades según lo que ingrese el usuario
  const loadOptions = async (inputValue) => {
    if (inputValue.length > 2) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/find?q=${inputValue}&appid=9fa0bd6b6465044fc809ee5d027bcc55&units=metric`
        );
        const citiesData = await response.json();
        return citiesData.list.map((city) => ({
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

  // Manejar cambio de ciudad
  const handleCityChange = (selectedOption) => {
    setCity(selectedOption.value);
    fetchWeatherData(selectedOption.value);
  };

  // Determinar qué ícono mostrar según el clima
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

  // Se usará para aplicar clases de fondo según el clima
  const weatherClass = data ? data.weather[0].main.toLowerCase() : '';

  return (
    <div className={`divPadre weatherBackground ${weatherClass}`}>
      {/* Animación de lluvia */}
      {data && data.weather[0].main === 'Rain' && (
        <div className="rain-container">
          {Array.from({ length: 50 }).map((_, index) => (
            <div
              key={index}
              className="raindrop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random()}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Animación de nubes */}
      {data && data.weather[0].main === 'Clouds' && (
        <div className="clouds">
          <div className="cloud cloud1">
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>
          </div>
          <div className="cloud cloud2">
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>
          </div>
        </div>
      )}

      {/* Contenedor de información del clima */}
      <div className="divInfo">
        <h2>{city}</h2>
        {data &&
          (data.weather[0].main === 'Clear' ? (
            // En clima Clear, mostrar un sol animado centrado
            <div className="sunny-center"></div>
          ) : (
            <FontAwesomeIcon
              icon={getWeatherIcon(data.weather[0].main)}
              size="4x"
              className="weather-icon"
            />
          ))}
        {data && (
          <ul className="weatherInfo">
            <li>
              <FontAwesomeIcon icon={faThermometerHalf} className="weather-icon" /> Temperatura: {data.main.temp}°C
            </li>
            <li>
              <FontAwesomeIcon icon={faTint} className="weather-icon" /> Humedad: {data.main.humidity}%
            </li>
            <li>
              <FontAwesomeIcon icon={faWind} className="weather-icon" /> Viento: {data.wind.speed} m/s
            </li>
            <li>
              <FontAwesomeIcon icon={getWeatherIcon(data.weather[0].main)} className="weather-icon" /> Condición: {data.weather[0].description}
            </li>
          </ul>
        )}
      </div>

      {/* Contenedor para el AsyncSelect, posicionado siempre en la parte inferior del contenedor principal */}
      <div className="divInput">
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          onChange={handleCityChange}
          placeholder="Selecciona una ciudad..."
          noOptionsMessage={() => 'No hay opciones disponibles'}
        />
      </div>
    </div>
  );
}

export default App;
