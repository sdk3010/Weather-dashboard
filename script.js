let apiKey = 'cec6f930339d875bd0fe40594a8c9cce';
let unit = 'metric';

function saveCityToHistory(city) {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  history = history.filter(c => c !== city);
  history.unshift(city);
  if (history.length > 5) history.pop();
  localStorage.setItem('weatherHistory', JSON.stringify(history));
  showHistory();
}

function showHistory() {
  let historyContainer = document.getElementById('history');
  historyContainer.innerHTML = '';
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  
  history.forEach(city => {
    let historyButton = document.createElement('button');
    historyButton.textContent = city;
    historyButton.style.width = '100%';
    historyButton.style.marginTop = '5px';
    historyButton.onclick = function() { getWeatherData(city); };
    historyContainer.appendChild(historyButton);
  });
}

function getWeatherData(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    })
    .then(currentData => {
      showCurrentWeather(currentData);
      saveCityToHistory(city);
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);
    })
    .then(response => response.json())
    .then(showForecast)
    .catch(error => alert(error.message));
}

function showCurrentWeather(data) {
  let container = document.getElementById('currentWeather');
  let today = new Date().toISOString().split('T')[0];
  container.innerHTML = `
    <strong>${data.name} (${today})</strong>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Wind: ${data.wind.speed} M/S</p>
    <p>Humidity: ${data.main.humidity}%</p>
  `;
  document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('weatherIcon').style.display = 'block';
  document.getElementById('description').textContent = data.weather[0].description;
}

function showForecast(data) {
  let forecastContainer = document.getElementById('forecast');
  forecastContainer.innerHTML = '';
  let dailyForecasts = {};
  
  data.list.forEach(entry => {
    let date = entry.dt_txt.split(' ')[0];
    if (!dailyForecasts[date] && Object.keys(dailyForecasts).length < 4) {
      dailyForecasts[date] = entry;
    }
  });
  
  for (let date in dailyForecasts) {
    let day = dailyForecasts[date];
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <p><strong>(${date})</strong></p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather icon" />
      <p>Temp: ${day.main.temp}°C</p>
      <p>Wind: ${day.wind.speed} M/S</p>
      <p>Humidity: ${day.main.humidity}%</p>
    `;
    forecastContainer.appendChild(card);
  }
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
        .then(response => response.json())
        .then(currentData => {
          showCurrentWeather(currentData);
          saveCityToHistory(currentData.name);
          return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
        })
        .then(response => response.json())
        .then(showForecast);
    });
  } else {
    alert("Geolocation is not supported by your browser");
  }
}

function searchWeather() {
  let cityInput = document.getElementById('cityInput');
  let city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
    cityInput.value = '';
  }
}

showHistory();
