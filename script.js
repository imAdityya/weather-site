const apiKey = "f623ed99b21510f3d9ff4b8768871c64";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const aqi = `https://api.openweathermap.org/data/2.5/air_pollution?`;

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const error = document.querySelector(".error");
const weather = document.querySelector(".weather");

async function checkWeather(param, isLatLon = false) {
    let response;
    if (isLatLon) {
        const { lat, lon } = param;
        response = await fetch(`${apiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
    } else {
        response = await fetch(`${apiUrl}&q=${param}&appid=${apiKey}`);
    }

    if (response.status === 404) {
        error.style.display = "block";
        weather.style.display = "none";
    } else {
        const data = await response.json();
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        const aqiResponse = await fetch(`${aqi}lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const aqiData = await aqiResponse.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.floor(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = Math.floor(data.wind.speed) + " km/h";
        document.querySelector("#cond").innerHTML = data.weather[0].main;
        document.querySelector("#feel-temp").innerHTML = Math.floor(data.main.feels_like) + "°c";
        document.querySelector("#aqiNum").innerHTML = aqiData.list[0].main.aqi;

        const currentTime = new Date().getTime() / 1000;
        const sunrise = data.sys.sunrise;
        const sunset = data.sys.sunset;

        const isDay = currentTime >= sunrise && currentTime <= sunset;
        const timeOfDay = isDay ? "day" : "night";

        if (data.weather[0].main === "Clouds") {
            weatherIcon.src = `images/clouds-${timeOfDay}.png`;
        } else if (data.weather[0].main === "Rain") {
            weatherIcon.src = `images/rain-${timeOfDay}.png`;
        } else if (data.weather[0].main === "Clear") {
            weatherIcon.src = `images/clear-${timeOfDay}.png`;
        } else if (data.weather[0].main === "Mist" || data.weather[0].main === "Haze") {
            weatherIcon.src = `images/mist-${timeOfDay}.png`;
        } else if (data.weather[0].main === "Drizzle") {
            weatherIcon.src = `images/drizzle-${timeOfDay}.png`;
        } else if (data.weather[0].main === "Snow") {
            weatherIcon.src = `images/snow-${timeOfDay}.png`;
        }

        error.style.display = "none";
        weather.style.display = "block";
        searchBox.value = "";
    }
}

searchBtn.addEventListener("click", () => {
    
    
    checkWeather(searchBox.value.trim());
});

searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        searchBtn.click();
    }
});

const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                checkWeather({ lat, lon }, true); // Call checkWeather with latitude and longitude
            },
            async (error) => {
                console.warn("Geolocation permission denied. Falling back to IP-based location.");
                // Fetch IP-based location
                const ipResponse = await fetch("https://ipapi.co/json");
                const ipData = await ipResponse.json();
                checkWeather({ lat: ipData.latitude, lon: ipData.longitude }, true);
            }
        );
    } else {
        console.error("Geolocation not supported.");
        // Fallback to IP-based location
        fetch("https://ipapi.co/json")
            .then((response) => response.json())
            .then((ipData) => {
                checkWeather({ lat: ipData.latitude, lon: ipData.longitude }, true);
            })
            .catch((error) => {
                console.error("IP-based location failed:", error);
                checkWeather("New York"); // Default to a specific city
            });
    }
};

getLocation();