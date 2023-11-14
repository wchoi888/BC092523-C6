//Defining variables to retrieve elements from the HTML document using their IDs.

var searchBtn = document.getElementById("search-btn");
var responseText = document.getElementById("current-weather");
var forecastText = document.getElementById("forecast-text");
var cityDiv = document.getElementById("city-container");

//Defining function to populate the cityDiv element with buttons for each city in the provided city object.

function displayCities(city) {
  cityDiv.textContent = "";
  for (let i = 0; i < city.cityName.length; i++) {
    var cityBtn = document.createElement("button");
    cityBtn.setAttribute(
      "onclick",
      `displayCityWeather('${city.cityName[i]}')`
    );
    cityBtn.textContent = city.cityName[i];
    cityDiv.append(cityBtn);
  }
}

//Defining function to generate URLs for fetching weather and forecast data based on the provided city name.

function getUrl(city, type = "weather") {
  if (type == "forecast") {
    return `https://api.openweathermap.org/data/2.5/forecast?q=${city},us&units=imperial&APPID=613e1963a5754fdc86d6c3e6401bd7a5`;
  }
  return `https://api.openweathermap.org/data/2.5/weather?q=${city},us&units=imperial&APPID=613e1963a5754fdc86d6c3e6401bd7a5`;
}

// Defining function to handle the display of weather information.

function displayWeather() {
  var city = document.getElementById("city").value;
  var saveCity = JSON.parse(localStorage.getItem("saveCities"));
  if (saveCity == null) {
    saveCity = { cityName: [], url: [] };
  } else {
    displayCities(saveCity);
  }
  if (city == "") {
    city = "New York";
  } else {
    saveCity.cityName.push(city);
    saveCity.url.push(getUrl(city));
    localStorage.setItem("saveCities", JSON.stringify(saveCity));
    saveCity = JSON.parse(localStorage.getItem("saveCities"));
    displayCities(saveCity);
  }

  var forecastUrl = getUrl(city, "forecast");
  var weatherUrl = getUrl(city);
  loadUrl(weatherUrl, "weather", city);
  loadUrl(forecastUrl, "forecast", city);
}

//Defining function to fetch and display the weather and forecast data for the specified city

function displayCityWeather(city) {
  var forecastUrl = getUrl(city, "forecast");
  var weatherUrl = getUrl(city);
  loadUrl(weatherUrl, "weather", city);
  loadUrl(forecastUrl, "forecast", city);
}

// Defining function to use the Fetch API to make a GET request to the specified URL, and then calls either processWeatherData or processForecastData.

function loadUrl(requestUrl, type, city) {
  fetch(requestUrl, {
    method: "GET",
    headers: {},
  })
    .then(function (response) {
      if (!response.ok) {
        throw response;
      }

      return response.json();
    })
    .then(function (response) {
      if (type == "forecast") {
        processForecastData(response);
      } else {
        processWeatherData(response, city);
      }
    })
    .catch(function (errorResponse) {
      if (errorResponse.text) {
        //additional error information
        errorResponse.text().then(function (errorMessage) {
          // Handle the error message if needed
        });
      }
    });
}

//Defining function to process the forecast data for 5 days by grouping them by day and creating HTML elements to display the forecast information.

function processForecastData(response) {
  forecastText.textContent = "";
  var forecastData = response.list;

  var dailyForecast = {};
  for (var i = 0; i < forecastData.length; i++) {
    var date = forecastData[i].dt_txt.split(" ")[0];

    if (!dailyForecast[date]) {
      dailyForecast[date] = {
        date: date,
        temperatures: [],
        humidity: [],
        wind: [],
        icon: [],
      };
    }

    dailyForecast[date].temperatures.push(forecastData[i].main.temp);
    dailyForecast[date].humidity.push(forecastData[i].main.humidity);
    dailyForecast[date].wind.push(forecastData[i].wind.speed);
    dailyForecast[date].icon.push(forecastData[i].weather[0].icon);
  }

  var dailyForecastArray = Object.values(dailyForecast);

  dailyForecastArray.forEach(function (element) {
    var dateDiv = document.createElement("div");
    var containerDiv = document.createElement("div");
    containerDiv.setAttribute("class", "card");
    forecastText.append(containerDiv);
    var weatherIcon = document.createElement("img");
    weatherIcon.setAttribute(
      "src",
      `http://openweathermap.org/img/w/${element.icon[0]}.png`
    );
    dateDiv.textContent = element.date;
    dateDiv.append(weatherIcon);
    containerDiv.append(dateDiv);
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = "Temp " + element.temperatures[0] + "&#8457";
    containerDiv.append(tempDiv);
    var windDiv = document.createElement("div");
    windDiv.textContent = "wind " + element.wind[0] + " MPH";
    containerDiv.append(windDiv);
    var humidityDiv = document.createElement("div");
    humidityDiv.textContent = "humidity " + element.humidity[0] + " %";
    containerDiv.append(humidityDiv);
  });
}

// Defining function to process the current weather data and creates HTML elements to display the weather information.

function processWeatherData(response, city) {
  var weatherData = response;
  responseText.textContent = "";
  var dateDiv = document.createElement("div");

  var weatherIcon = document.createElement("img");
  weatherIcon.setAttribute(
    "src",
    `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`
  );
  var date = new Date(weatherData.dt * 1000);
  var normalDate = date.toLocaleDateString("en-US");
  dateDiv.textContent = city + " " + normalDate;
  dateDiv.append(weatherIcon);
  responseText.append(dateDiv);
  //console.log(dateDiv);
  var tempDiv = document.createElement("div");
  tempDiv.innerHTML = "Temp: " + weatherData.main.temp + "&#8457";
  responseText.append(tempDiv);
  //console.log(tempDiv);
  var windDiv = document.createElement("div");
  windDiv.textContent = "wind " + weatherData.wind.speed + " MPH";
  responseText.append(windDiv);
  var humidityDiv = document.createElement("div");
  humidityDiv.textContent = "humidity " + weatherData.main.humidity + " %";
  responseText.append(humidityDiv);
}

//Creating an event listener on the "searchBtn" element and initiating the weather display process.

searchBtn.addEventListener("click", displayWeather);
