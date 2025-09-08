const API_KEY = "4b5d60dc0533982ff465c56c96f6e387";  // Put your actual API key here

const cityInput = document.getElementById("cityInput");
const LocBtn = document.getElementById("LocBtn");
const checkBtn = document.getElementById("checkBtn");
const resultDiv = document.getElementById("result");

let getAQIDescription = (aqi) =>{
    switch (aqi) {
    case 1: return "Good";
    case 2: return "Fair";
    case 3: return "Moderate";
    case 4: return "Poor";
    case 5: return "Very Poor";
    default: return "Unknown";
  }
}

let displayResult = async (data,locationName) => {
    const aqi = data.list[0].main.aqi;
    const pm25 = data.list[0].components.pm2_5;
    const pm10 = data.list[0].components.pm10;

    resultDiv.innerHTML = `
        <h3>Air Quality for ${locationName}</h3>
        <p><strong>AQI:</strong> ${aqi} (${getAQIDescription(aqi)})</p>
        <p><strong>PM2.5:</strong> ${pm25} µg/m³</p>
        <p><strong>PM10:</strong> ${pm10} µg/m³</p>
        `
}


let fetchAirPollution = async (lat ,lon, locationName ) => {
    try{
        resultDiv.innerHTML = "<p>Loading air quality data...</p>";
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch air pollution data");
        const data = await response.json();
        displayResult(data,locationName);
     }catch (error) {
    resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function fetchCoordsByCity(cityName) {
    try{
        resultDiv.innerHTML = "<p>Fetching city coordinates...</p>";
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch air pollution data");
        const data = await response.json();
        if(data.length == 0){
            resultDiv.innerHTML = `<p>City not found: ${cityName}</p>`;
            return;
        }
        const {lat,lon,name,country} = data[0];
        fetchAirPollution(lat,lon,`${name},${country}`);
    }
    catch(error){
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    }
    
}

let fetchCoordsByLocation = async () =>{
    if(!navigator.geolocation){
        alert("Geolocation is not supported by your browser.");
        return;
    }
    resultDiv.innerHTML = "<p>Getting your location...</p>";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchAirPollution(lat, lon, "Your Location");
        },
    (error) => {
      resultDiv.innerHTML = "<p>Unable to get your location.</p>";
    }
    );
}

checkBtn.addEventListener("click",() => {
    const city = cityInput.value.trim();
    if (!city) {
    alert("Please enter a city name.");
    return;
  }
  fetchCoordsByCity(city);
});

LocBtn.addEventListener("click",() =>{
    fetchCoordsByLocation();
});