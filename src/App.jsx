// src/App.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncSelect from 'react-select/async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './i18n';
import './style.css';

const API_KEY = '9fa0bd6b6465044fc809ee5d027bcc55';

// Función debounce para evitar llamadas excesivas
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(async () => {
        const result = await func(...args);
        resolve(result);
      }, delay);
    });
  };
};

// ErrorBoundary para capturar errores inesperados
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-boundary">
          Something went wrong. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('weather');
  const [forecastMode, setForecastMode] = useState('days');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light'); // "light" o "dark"
  const [notification, setNotification] = useState('');

  const cache = useRef({});

  // Cargar favoritos e historial desde localStorage al inicio
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    const storedHistory = localStorage.getItem('history');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Persistir favoritos e historial en localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  // Función para cargar opciones en AsyncSelect con caché
  const loadOptions = async (inputValue) => {
    if (inputValue.length > 2) {
      if (cache.current[inputValue]) return cache.current[inputValue];
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/find?q=${inputValue}&appid=${API_KEY}&units=${unit}&lang=${i18n.language}`
        );
        const result = await response.json();
        const options = result.list.map((city) => ({
          label: city.name,
          value: city.name,
        }));
        cache.current[inputValue] = options;
        return options;
      } catch (err) {
        console.error(err);
        return [];
      }
    }
    return [];
  };

  const debouncedLoadOptions = useMemo(() => debounce(loadOptions, 300), [unit, i18n.language]);

  // Función para obtener clima y pronóstico
  const fetchWeather = useCallback(async (cityName) => {
    setLoading(true);
    setError('');
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}&lang=${i18n.language}`
      );
      if (!weatherResponse.ok) throw new Error(t('cityNotFound'));
      const weather = await weatherResponse.json();
      setWeatherData(weather);
      setHistory((prev) => [cityName, ...prev.filter((c) => c !== cityName)]);
      // Notificación: alerta si el clima es extremo
      const temp = weather.main.temp;
      const condition = weather.weather[0].main;
      if (condition === "Thunderstorm" || temp > 35 || temp < -5) {
        setNotification(t('extremeAlert'));
      } else {
        setNotification('');
      }
    } catch (err) {
      setError(err.message || t('cityNotFound'));
      setWeatherData(null);
    }
    try {
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}&lang=${i18n.language}`
      );
      if (!forecastResponse.ok) throw new Error(t('forecastNotFound'));
      const forecast = await forecastResponse.json();
      setForecastData(forecast.list);
    } catch (err) {
      setError(err.message || t('forecastNotFound'));
      setForecastData([]);
    }
    setLoading(false);
  }, [unit, i18n.language, t]);

  // Obtener ubicación inicial mediante geolocalización
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
          setError(t('errorLocation'));
        }
      });
    }
  }, [fetchWeather, t]);

  const handleCityChange = useCallback((selectedOption) => {
    setCity(selectedOption.value);
    fetchWeather(selectedOption.value);
  }, [fetchWeather]);

  const toggleUnit = useCallback(() => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (city) fetchWeather(city);
  }, [unit, city, fetchWeather]);

  const handleLanguageChange = useCallback((e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    if (city) fetchWeather(city);
  }, [city, fetchWeather, i18n]);

  const addFavorite = useCallback(() => {
    if (city && !favorites.includes(city)) {
      setFavorites((prev) => [...prev, city]);
    }
  }, [city, favorites]);

  const selectFavorite = useCallback((fav) => {
    setCity(fav);
    fetchWeather(fav);
    setActiveTab('weather');
  }, [fetchWeather]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Íconos de clima
  const getClearIcon = useCallback((timestamp = Math.floor(Date.now() / 1000)) => {
    if (weatherData && weatherData.sys) {
      const { sunrise, sunset } = weatherData.sys;
      return timestamp < sunrise || timestamp > sunset 
        ? <div className="moon-icon" aria-hidden="true">🌙</div>
        : <div className="sunny-icon" aria-hidden="true"></div>;
    }
    return <div className="sunny-icon" aria-hidden="true"></div>;
  }, [weatherData]);

  const getWeatherIcon = useCallback((weather, timestamp) => {
    switch (weather) {
      case 'Clear':
        return getClearIcon(timestamp);
      case 'Rain':
        return <div className="rain-icon" aria-hidden="true"></div>;
      case 'Clouds':
        return <div className="cloud-icon" aria-hidden="true"></div>;
      case 'Snow':
        return <div className="snow-icon" aria-hidden="true"></div>;
      case 'Thunderstorm':
        return <div className="thunder-icon" aria-hidden="true"></div>;
      case 'Drizzle':
        return <div className="drizzle-icon" aria-hidden="true"></div>;
      case 'Mist':
        return <div className="mist-icon" aria-hidden="true"></div>;
      default:
        return <div className="cloud-icon" aria-hidden="true"></div>;
    }
  }, [getClearIcon]);

  const dailyForecast = forecastData.filter((item) => item.dt_txt.includes('12:00:00'));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
  };

  // Botón para compartir (usa API nativa o copia enlace)
  const handleShare = async () => {
    const shareData = {
      title: t('welcome'),
      text: `${t('weatherTab')}: ${city} - ${weatherData && weatherData.main.temp} ${unit === 'metric' ? '°C' : '°F'}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert(t('shareCopied') || "Link copied to clipboard");
    }
  };

  // Botón para ver mapa (abre Google Maps con coordenadas)
  const handleViewMap = () => {
    if (weatherData && weatherData.coord) {
      const { lat, lon } = weatherData.coord;
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      window.open(mapUrl, '_blank');
    }
  };

  let backgroundClass = '';
  if (weatherData) {
    switch (weatherData.weather[0].main) {
      case 'Clouds':
        backgroundClass = 'Clouds';
        break;
      case 'Rain':
        backgroundClass = 'Rain';
        break;
      case 'Snow':
        backgroundClass = 'Snow';
        break;
      case 'Thunderstorm':
        backgroundClass = 'Thunderstorm';
        break;
      default:
        backgroundClass = '';
    }
  }

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className={`divPadre ${theme} weatherBackground ${backgroundClass} ${weatherData ? weatherData.weather[0].main.toLowerCase() : ''}`}>
        {/* Notificación para clima extremo */}
        {notification && <div className="notification" role="alert">{notification}</div>}
        
        {/* Barra superior con toggle de tema */}
        <div className="topBar" role="banner">
          <button onClick={toggleTheme} className="btn themeToggle" aria-label={t('toggleTheme')}>
            {t('toggleTheme')}
          </button>
        </div>

        <div className="headerInside">
          <AsyncSelect
            cacheOptions
            loadOptions={debouncedLoadOptions}
            onChange={handleCityChange}
            placeholder={t('selectCity')}
            noOptionsMessage={() => t('selectCity')}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            aria-label={t('selectCity')}
          />
          <button className="btn toggleUnit" onClick={toggleUnit} aria-label="Toggle temperature unit">
            <FontAwesomeIcon icon={faExchangeAlt} /> {unit === 'metric' ? '°C' : '°F'}
          </button>
          <select className="languageSelect" value={i18n.language} onChange={handleLanguageChange} aria-label="Select language">
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>

        <div className="tabs" role="tablist">
          <button
            className={`btn ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
            role="tab"
            aria-selected={activeTab === 'weather'}
          >
            {t('weatherTab')}
          </button>
          <button
            className={`btn ${activeTab === 'forecast' ? 'active' : ''}`}
            onClick={() => setActiveTab('forecast')}
            role="tab"
            aria-selected={activeTab === 'forecast'}
          >
            {t('forecastTab')}
          </button>
          <button
            className={`btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
            role="tab"
            aria-selected={activeTab === 'favorites'}
          >
            {t('favoritesTab')}
          </button>
          <button
            className={`btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            role="tab"
            aria-selected={activeTab === 'history'}
          >
            {t('historyTab')}
          </button>
        </div>

        {loading && <div className="spinner" role="status" aria-live="polite">{t('loading')}</div>}

        {activeTab === 'weather' && (
          <div className="mainContainer" role="tabpanel">
            <div className="divInfo">
              <h2>{city}</h2>
              {weatherData ? (
                <div className="weatherMain">
                  {weatherData.weather[0].main === 'Clear'
                    ? getClearIcon()
                    : getWeatherIcon(weatherData.weather[0].main)}
                  <div className="weatherDetails">
                    <p>{t('temperature')}: {weatherData.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
                    <p>{t('feelsLike')}: {weatherData.main.feels_like} {unit === 'metric' ? '°C' : '°F'}</p>
                    <p>{t('humidity')}: {weatherData.main.humidity}%</p>
                    <p>{t('wind')}: {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
                    <p>{t('pressure')}: {weatherData.main.pressure} hPa</p>
                    <p>{t('sunrise')}: {formatTime(weatherData.sys.sunrise)}</p>
                    <p>{t('sunset')}: {formatTime(weatherData.sys.sunset)}</p>
                    <p>{t('condition')}: {weatherData.weather[0].description}</p>
                  </div>
                  <div className="actionButtons">
                    <button className="btn favoriteButton" onClick={addFavorite} aria-label={t('addFavorite')}>
                      <FontAwesomeIcon icon={faStar} /> {t('addFavorite')}
                    </button>
                    <button className="btn mapButton" onClick={handleViewMap} aria-label={t('viewMap')}>
                      {t('viewMap')}
                    </button>
                    <button className="btn shareButton" onClick={handleShare} aria-label={t('share')}>
                      {t('share')}
                    </button>
                  </div>
                </div>
              ) : (
                !loading && <p>{t('loading')}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="forecast" role="tabpanel">
            <h3>{t('forecastTab')} {city}</h3>
            <div className="forecastModeTabs">
              <button
                className={`btn ${forecastMode === 'hours' ? 'active' : ''}`}
                onClick={() => setForecastMode('hours')}
                aria-label="View hours forecast"
              >
                Próximas Horas
              </button>
              <button
                className={`btn ${forecastMode === 'days' ? 'active' : ''}`}
                onClick={() => setForecastMode('days')}
                aria-label="View days forecast"
              >
                Próximos Días
              </button>
            </div>
            <div className="forecastList">
              {forecastMode === 'days'
                ? dailyForecast.map((item) => (
                    <div key={item.dt} className="forecastItem">
                      <p>{new Date(item.dt * 1000).toLocaleDateString(i18n.language, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}</p>
                      <p>{new Date(item.dt * 1000).toLocaleTimeString(i18n.language, {
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
                      <p>{new Date(item.dt * 1000).toLocaleTimeString(i18n.language, {
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
          <div className="favorites" role="tabpanel">
            <h3>{t('favoritesTab')}</h3>
            <div className="favoritesList">
              {favorites.map((fav, index) => (
                <button key={index} className="btn favoriteItem" onClick={() => selectFavorite(fav)} aria-label={`Select ${fav}`}>
                  {fav}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history" role="tabpanel">
            <h3>{t('historyTab')}</h3>
            <div className="historyList">
              {history.map((item, index) => (
                <span key={index} className="historyItem">{item}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default WrappedApp;
