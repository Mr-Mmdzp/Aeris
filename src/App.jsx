import { useEffect, useState } from "react"
import "./index.css"

const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "❄️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Heavy showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm", "⛈️"],
  99: ["Thunderstorm", "⛈️"],
}

function App() {
  const [city, setCity] = useState("London")
  const [search, setSearch] = useState("")
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function getWeather() {
  try {
    setLoading(true)
    setError("")

    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    setWeather({
      location: {
        name: "London",
        country: "United Kingdom",
      },
      ...data,
    })

    setCity("London")

  } catch (err) {
    console.error("Weather error:", err)
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
async function searchCity(cityName) {
  try {
    setLoading(true)
    setError("")

    // پیدا کردن شهر با Nominatim
    const locationResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cityName
      )}&limit=1&addressdetails=1`
    )

    if (!locationResponse.ok) {
      throw new Error("Could not search for city")
    }

    const locationData = await locationResponse.json()

    if (locationData.length === 0) {
      throw new Error("City not found")
    }

    const location = locationData[0]

    const latitude = location.lat
    const longitude = location.lon

    // گرفتن آب و هوا
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    )

    if (!weatherResponse.ok) {
      throw new Error("Could not get weather data")
    }

    const weatherData = await weatherResponse.json()

    // اسم شهر و کشور
    const address = location.address || {}

const foundCity =
  address.city ||
  address.town ||
  address.village ||
  address.municipality ||
  location.name

const countryName = address.country || ""

setWeather({
  location: {
    name: foundCity,
    country: countryName,
  },
  ...weatherData,
})

setCity(foundCity)

  } catch (err) {
    console.error("Search error:", err)
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  function handleSearch(e) {
  e.preventDefault()

  if (!search.trim()) return

  searchCity(search.trim())
  setSearch("")
}

  function getCurrentLocation() {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported.")
    return
  }

  setLoading(true)
  setError("")

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords

        // Get weather
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
        )

        if (!weatherResponse.ok) {
          throw new Error("Weather API error")
        }

        const weatherData = await weatherResponse.json()

        // Get city name
        const locationResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
        )

        if (!locationResponse.ok) {
          throw new Error("Location API error")
        }

        const locationData = await locationResponse.json()

        const address = locationData.address

        const cityName =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          "Unknown location"

        const countryName = address.country || ""

        setWeather({
          location: {
            name: cityName,
            country: countryName,
          },
          ...weatherData,
        })

        setCity(cityName)

      } catch (err) {
        console.error("Location error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    () => {
      setError("Location permission was denied.")
      setLoading(false)
    }
  )
}

  useEffect(() => {
    getWeather("London")
  }, [])

  const getWeatherInfo = (code) => {
    return weatherCodes[code] || ["Unknown", "🌡️"]
  }

  const formatDay = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    })
  }

  return (
    <div className="app">

      <header className="header">
        <div className="logo">
          AERIS
        </div>

        <nav>
          <a href="#weather">Weather</a>
          <a href="#forecast">Forecast</a>
          <a href="#details">Details</a>
        </nav>

        <button
          className="location-btn"
          onClick={getCurrentLocation}
        >
          📍 My Location
        </button>
      </header>

      <main>

        <section className="hero" id="weather">

          <div className="hero-top">
            <div>
              <p className="eyebrow">CURRENT WEATHER</p>

              <h1>
                {weather?.location?.name || city}
              </h1>

              <p className="country">
                {weather?.location?.country}
              </p>
            </div>

            <form onSubmit={handleSearch} className="search">
              <input
                type="text"
                placeholder="Search city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button type="submit">
                Search
              </button>
            </form>
          </div>

          {loading && (
            <div className="loading">
              Loading weather...
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {weather && !loading && (
            <>
              <div className="main-weather">

                <div className="temperature">
                  <span>
                    {Math.round(weather.current.temperature_2m)}
                  </span>
                  <small>°C</small>
                </div>

                <div className="condition">
                  <div className="weather-icon">
                    {getWeatherInfo(
                      weather.current.weather_code
                    )[1]}
                  </div>

                  <div>
                    <h2>
                      {getWeatherInfo(
                        weather.current.weather_code
                      )[0]}
                    </h2>

                    <p>
                      Feels like{" "}
                      {Math.round(
                        weather.current.apparent_temperature
                      )}
                      °C
                    </p>
                  </div>
                </div>

              </div>

              <div className="stats" id="details">

                <div className="stat">
                  <span>💧</span>
                  <div>
                    <small>Humidity</small>
                    <strong>
                      {weather.current.relative_humidity_2m}%
                    </strong>
                  </div>
                </div>

                <div className="stat">
                  <span>💨</span>
                  <div>
                    <small>Wind</small>
                    <strong>
                      {Math.round(
                        weather.current.wind_speed_10m
                      )} km/h
                    </strong>
                  </div>
                </div>

                <div className="stat">
                  <span>🌧️</span>
                  <div>
                    <small>Precipitation</small>
                    <strong>
                      {weather.current.precipitation} mm
                    </strong>
                  </div>
                </div>

                <div className="stat">
                  <span>☀️</span>
                  <div>
                    <small>Daylight</small>
                    <strong>
                      {weather.current.is_day ? "Day" : "Night"}
                    </strong>
                  </div>
                </div>

              </div>
            </>
          )}
        </section>


        {weather && !loading && (
          <section className="forecast" id="forecast">

            <div className="section-heading">
              <div>
                <p className="eyebrow">7 DAY FORECAST</p>
                <h2>Coming Days</h2>
              </div>
            </div>

            <div className="forecast-grid">

              {weather.daily.time.map((date, index) => {
                const [condition, icon] =
                  getWeatherInfo(
                    weather.daily.weather_code[index]
                  )

                return (
                  <div
                    className={`forecast-card ${
                      index === 0 ? "today" : ""
                    }`}
                    key={date}
                  >

                    <div className="day">
                      {index === 0
                        ? "Today"
                        : formatDay(date)}
                    </div>

                    <div className="forecast-icon">
                      {icon}
                    </div>

                    <p>{condition}</p>

                    <div className="forecast-temp">
                      <strong>
                        {Math.round(
                          weather.daily.temperature_2m_max[index]
                        )}°
                      </strong>

                      <span>
                        {Math.round(
                          weather.daily.temperature_2m_min[index]
                        )}°
                      </span>
                    </div>

                    <div className="rain">
                      💧{" "}
                      {
                        weather.daily
                          .precipitation_probability_max[index]
                      }%
                    </div>

                  </div>
                )
              })}

            </div>

          </section>
        )}

      </main>

      <footer>
        <div className="logo">AERIS</div>
        <p>Developed & designed By : Mr-Mmdzp</p>
        <p>Weather, beautifully simplified.</p>
      </footer>

    </div>
  )
}

export default App