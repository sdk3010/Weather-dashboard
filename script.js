let apiKey = 'cec6f930339d875bd0fe40594a8c9cce';
let unit = 'metric';

function saveCity(city) {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  history = history.filter(function(c) { return c !== city; });
  history.unshift(city);
  if (history.length > 5) history.pop();
  localStorage.setItem('weatherHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  let container = document.getElementById('history');
  container.innerHTML = '';
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  history.forEach(function(city) {
    let btn = document.createElement('button');
    btn.textContent = city;
    btn.style.width = '100%';
    btn.style.marginTop = '5px';
    btn.onclick = function() { fetchWeather(city); };
    container.appendChild(btn);
  });
}

function fetchWeather(city) {
  fetchWeatherCurrent(city)
    .then(function(data) {
      displayCurrent(data);
      saveCity(city);
      return fetchWeatherForecast(city);
    })
    .then(function(data) {
      displayForecast(data);
    })
    .catch(function(err) {
      alert(err.message);
    });
}

function fetchWeatherCurrent(city) {
  return fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=' + unit)
    .then(function(res) {
      if (!res.ok) throw new Error('City not found');
      return res.json();
    });
}

function fetchWeatherForecast(city) {
  return fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey + '&units=' + unit)
    .then(function(res) {
      return res.json();
    });
}

function displayCurrent(data) {
  let today = new Date().toISOString().split('T')[0];
  let container = document.getElementById('currentWeather');
  container.innerHTML = 
    '<strong>' + data.name + ' (' + today + ')</strong>' +
    '<p>Temperature: ' + data.main.temp + '°C</p>' +
    '<p>Wind: ' + data.wind.speed + ' M/S</p>' +
    '<p>Humidity: ' + data.main.humidity + '%</p>';
  let icon = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';
  document.getElementById('weatherIcon').src = icon;
  document.getElementById('weatherIcon').style.display = 'block';
  document.getElementById('description').textContent = data.weather[0].description;
}

function displayForecast(data) {
  let container = document.getElementById('forecast');
  container.innerHTML = '';
  let daily = {};
  data.list.forEach(function(item) {
    let date = item.dt_txt.split(' ')[0];
    if (!daily[date] && Object.keys(daily).length < 4) daily[date] = item;
  });
  for (let date in daily) {
    let day = daily[date];
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = 
      '<p><strong>' + date + '</strong></p>' +
      '<img src="https://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png" alt="Icon" />' +
      '<p>Temp: ' + day.main.temp + '°C</p>' +
      '<p>Wind: ' + day.wind.speed + ' M/S</p>' +
      '<p>Humidity: ' + day.main.humidity + '%</p>';
    container.appendChild(card);
  }
}

function fetchWeatherByLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(function(pos) {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;

    fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&units=' + unit)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        displayCurrent(data);
        saveCity(data.name);
        return fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&units=' + unit);
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        displayForecast(data);
      });
  });
}

function handleSearch() {
  let city = document.getElementById('cityInput').value.trim();
  if (city) {
    fetchWeather(city);
    document.getElementById('cityInput').value = '';
  }
}

renderHistory();
