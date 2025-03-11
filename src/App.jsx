import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloud,
  faCloudRain,
  faSnowflake,
  faBolt,
  faSmog,
  faCloudShowersHeavy,
  faExchangeAlt,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import './style.css';

const API_KEY = '9fa0bd6b6465044fc809ee5d027bcc55';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric'); // metric: °C, imperial: °F
  const [language, setLanguage] = useState('en');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('weather'); // 'weather' o 'forecast'

  // Obtener ubicación y ciudad inicial
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const locationData = await response.json();
          const cityName =
            locationData.address.city ||
            locationData.address.town ||
            locationData.address.village ||
            'London';
          setCity(cityName);
          fetchWeather(cityName);
        } catch (err) {
          setError('Error al obtener la ubicación');
        }
      });
    }
  }, []);

  // Función para obtener clima y pronóstico
  const fetchWeather = async (cityName) => {
    setError('');
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}&lang=${language}`
      );
      if (!weatherResponse.ok) throw new Error('Ciudad no encontrada');
      const weather = await weatherResponse.json();
      setWeatherData(weather);
      setHistory((prev) => [cityName, ...prev.filter((c) => c !== cityName)]);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    }
    try {
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}&lang=${language}`
      );
      if (!forecastResponse.ok) throw new Error('Pronóstico no encontrado');
      const forecast = await forecastResponse.json();
      setForecastData(forecast.list);
    } catch (err) {
      setError(err.message);
      setForecastData([]);
    }
  };

  // Función para cargar opciones en AsyncSelect
  const loadOptions = async (inputValue) => {
    if (inputValue.length > 2) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/find?q=${inputValue}&appid=${API_KEY}&units=${unit}&lang=${language}`
        );
        const result = await response.json();
        return result.list.map((city) => ({
          label: city.name,
          value: city.name
        }));
      } catch (err) {
        console.error(err);
        return [];
      }
    }
    return [];
  };

  const handleCityChange = (selectedOption) => {
    setCity(selectedOption.value);
    fetchWeather(selectedOption.value);
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (city) fetchWeather(city);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (city) fetchWeather(city);
  };

  const addFavorite = () => {
    if (city && !favorites.includes(city)) {
      setFavorites([...favorites, city]);
    }
  };

  const selectFavorite = (fav) => {
    setCity(fav);
    fetchWeather(fav);
  };

  // Función auxiliar para determinar si es de día o noche en condiciones "Clear"
  const getClearIcon = (timestamp = Math.floor(Date.now() / 1000)) => {
    if (weatherData && weatherData.sys) {
      const { sunrise, sunset } = weatherData.sys;
      // Si el timestamp es menor que el amanecer o mayor que el atardecer, es de noche
      if (timestamp < sunrise || timestamp > sunset) {
        return <div className="moon-icon"></div>;
      } else {
        return <div className="sunny-icon"></div>;
      }
    }
    // Fallback
    return <div className="sunny-icon"></div>;
  };

  // Función que retorna el icono apropiado según el tipo de clima
  const getWeatherIcon = (weather, timestamp) => {
    switch (weather) {
      case 'Clear':
        return getClearIcon(timestamp);
      case 'Rain':
        return <FontAwesomeIcon icon={faCloudShowersHeavy} className="weather-icon" />;
      case 'Clouds':
        return <FontAwesomeIcon icon={faCloud} className="weather-icon" />;
      case 'Snow':
        return <FontAwesomeIcon icon={faSnowflake} className="weather-icon" />;
      case 'Thunderstorm':
        return <FontAwesomeIcon icon={faBolt} className="weather-icon" />;
      case 'Drizzle':
        return <FontAwesomeIcon icon={faCloudRain} className="weather-icon" />;
      case 'Mist':
        return <FontAwesomeIcon icon={faSmog} className="weather-icon" />;
      default:
        return <FontAwesomeIcon icon={faCloud} className="weather-icon" />;
    }
  };

  // Filtrar el pronóstico para datos diarios a las 12:00
  const dailyForecast = forecastData.filter((item) =>
    item.dt_txt.includes('12:00:00')
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`divPadre weatherBackground ${weatherData ? weatherData.weather[0].main.toLowerCase() : ''}`}>
      {error && <div className="error">{error}</div>}

      {/* Header interno */}
      <div className="headerInside">
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          onChange={handleCityChange}
          placeholder="Selecciona una ciudad..."
          noOptionsMessage={() => 'No hay opciones disponibles'}
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
        <button className="toggleUnit" onClick={toggleUnit}>
          <FontAwesomeIcon icon={faExchangeAlt} /> {unit === 'metric' ? '°C' : '°F'}
        </button>
        <select className="languageSelect" value={language} onChange={handleLanguageChange}>
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
      </div>

      {/* Contenedor de pestañas */}
      <div className="tabs">
        <button className={activeTab === 'weather' ? 'active' : ''} onClick={() => setActiveTab('weather')}>
          Clima
        </button>
        <button className={activeTab === 'forecast' ? 'active' : ''} onClick={() => setActiveTab('forecast')}>
          Pronóstico
        </button>
      </div>

      {/* Renderizado condicional según pestaña */}
      {activeTab === 'weather' ? (
        <div className="mainContainer">
          <div className="divInfo">
            <h2>{city}</h2>
            {weatherData ? (
              <div className="weatherMain">
                {weatherData.weather[0].main === 'Clear' ? (
                  // Usamos el helper para obtener sol o luna según la hora actual
                  getClearIcon()
                ) : (
                  getWeatherIcon(weatherData.weather[0].main)
                )}
                <div className="weatherDetails">
                  <p>Temperatura: {weatherData.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
                  <p>Sensación: {weatherData.main.feels_like} {unit === 'metric' ? '°C' : '°F'}</p>
                  <p>Humedad: {weatherData.main.humidity}%</p>
                  <p>Viento: {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
                  <p>Presión: {weatherData.main.pressure} hPa</p>
                  <p>Amanecer: {formatTime(weatherData.sys.sunrise)}</p>
                  <p>Atardecer: {formatTime(weatherData.sys.sunset)}</p>
                  <p>Condición: {weatherData.weather[0].description}</p>
                </div>
                <button className="favoriteButton" onClick={addFavorite}>
                  <FontAwesomeIcon icon={faStar} /> Agregar a Favoritos
                </button>
              </div>
            ) : (
              <p>Cargando datos...</p>
            )}
          </div>

          {favorites.length > 0 && (
            <div className="favorites">
              <h3>Favoritos</h3>
              <div className="favoritesList">
                {favorites.map((fav, index) => (
                  <button key={index} className="favoriteItem" onClick={() => selectFavorite(fav)}>
                    {fav}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="history">
              <h3>Historial</h3>
              <div className="historyList">
                {history.map((item, index) => (
                  <span key={index} className="historyItem">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="forecast">
          {/* Encabezado del pronóstico que muestra ciudad y país (si se dispone) */}
          <h3>
            Pronóstico para {weatherData ? `${weatherData.name}, ${weatherData.sys.country}` : city}
          </h3>
          <div className="forecastList">
            {dailyForecast.map((item) => (
              <div key={item.dt} className="forecastItem">
                <p>
                  {new Date(item.dt * 1000).toLocaleDateString(language, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                {item.weather[0].main === 'Clear' ? (
                  // Para cada ítem del pronóstico, usamos su timestamp (item.dt)
                  getClearIcon(item.dt)
                ) : (
                  getWeatherIcon(item.weather[0].main, item.dt)
                )}
                <p>{item.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
