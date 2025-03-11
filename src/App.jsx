import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExchangeAlt,
  faStar,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import './style.css';

const API_KEY = '9fa0bd6b6465044fc809ee5d027bcc55';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' para °C, 'imperial' para °F
  const [language, setLanguage] = useState('en');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('weather'); // 'weather', 'forecast', 'favorites', 'history'
  const [forecastMode, setForecastMode] = useState('days'); // 'hours' o 'days'

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
    setActiveTab('weather');
  };

  // Función auxiliar para "Clear": si es de día o de noche
  const getClearIcon = (timestamp = Math.floor(Date.now() / 1000)) => {
    if (weatherData && weatherData.sys) {
      const { sunrise, sunset } = weatherData.sys;
      if (timestamp < sunrise || timestamp > sunset) {
        return <div className="moon-icon">🌙</div>;
      } else {
        return <div className="sunny-icon"></div>;
      }
    }
    return <div className="sunny-icon"></div>;
  };

  // Función para retornar el ícono según el estado del clima utilizando clases CSS
  const getWeatherIcon = (weather, timestamp) => {
    switch (weather) {
      case 'Clear':
        return getClearIcon(timestamp);
      case 'Rain':
        return <div className="rain-icon"></div>;
      case 'Clouds':
        return <div className="cloud-icon"></div>;
      case 'Snow':
        return <div className="snow-icon"></div>;
      case 'Thunderstorm':
        return <div className="thunder-icon"></div>;
      case 'Drizzle':
        return <div className="drizzle-icon"></div>;
      case 'Mist':
        return <div className="mist-icon"></div>;
      default:
        return <div className="cloud-icon"></div>;
    }
  };

  // Filtrar el pronóstico para datos diarios a las 12:00
  const dailyForecast = forecastData.filter((item) => item.dt_txt.includes('12:00:00'));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
  };

  // Asignar clase de fondo para nubes o lluvia según el estado
  let backgroundClass = '';
  if (weatherData) {
    if (weatherData.weather[0].main === 'Clouds') {
      backgroundClass = 'Clouds';
    } else if (weatherData.weather[0].main === 'Rain') {
      backgroundClass = 'Rain';
    }
  }

  return (
    <div className={`divPadre weatherBackground ${backgroundClass} ${weatherData ? weatherData.weather[0].main.toLowerCase() : ''}`}>
      {error && <div className="error">{error}</div>}

      {/* Renderizado de animación de nubes si el clima es Clouds o Rain */}
      {weatherData && (weatherData.weather[0].main === 'Clouds' || weatherData.weather[0].main === 'Rain') && (
        <div id="background-wrap">
          <div className="x1"><div className="cloud"></div></div>
          <div className="x2"><div className="cloud"></div></div>
          <div className="x3"><div className="cloud"></div></div>
          <div className="x4"><div className="cloud"></div></div>
          <div className="x5"><div className="cloud"></div></div>
        </div>
      )}

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

      {/* Pestañas de Navegación */}
      <div className="tabs">
        <button className={activeTab === 'weather' ? 'active' : ''} onClick={() => setActiveTab('weather')}>
          Clima
        </button>
        <button className={activeTab === 'forecast' ? 'active' : ''} onClick={() => setActiveTab('forecast')}>
          Pronóstico
        </button>
        <button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => setActiveTab('favorites')}>
          Favoritos
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          Historial
        </button>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'weather' && (
        <div className="mainContainer">
          <div className="divInfo">
            <h2>{city}</h2>
            {weatherData ? (
              <div className="weatherMain">
                {weatherData.weather[0].main === 'Clear'
                  ? getClearIcon()
                  : getWeatherIcon(weatherData.weather[0].main)}
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
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="forecast">
          <h3>Pronóstico para {weatherData ? `${weatherData.name}, ${weatherData.sys.country}` : city}</h3>
          <div className="forecastModeTabs">
            <button
              className={forecastMode === 'hours' ? 'active' : ''}
              onClick={() => setForecastMode('hours')}
            >
              Próximas Horas
            </button>
            <button
              className={forecastMode === 'days' ? 'active' : ''}
              onClick={() => setForecastMode('days')}
            >
              Próximos Días
            </button>
          </div>
          <div className="forecastList">
            {forecastMode === 'days'
              ? dailyForecast.map((item) => (
                  <div key={item.dt} className="forecastItem">
                    <p>{new Date(item.dt * 1000).toLocaleDateString(language, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}</p>
                    <p>{new Date(item.dt * 1000).toLocaleTimeString(language, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    {item.weather[0].main === 'Clear'
                      ? getClearIcon(item.dt)
                      : getWeatherIcon(item.weather[0].main, item.dt)}
                    <p>{item.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
                  </div>
                ))
              : forecastData.slice(0, 5).map((item) => (
                  <div key={item.dt} className="forecastItem">
                    <p>{new Date(item.dt * 1000).toLocaleTimeString(language, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    {item.weather[0].main === 'Clear'
                      ? getClearIcon(item.dt)
                      : getWeatherIcon(item.weather[0].main, item.dt)}
                    <p>{item.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
                  </div>
                ))}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
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

      {activeTab === 'history' && (
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
  );
}

export default App;
