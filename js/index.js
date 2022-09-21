let currentDate = new Date();
let apiKey = "c95d60a1e3adbeb286133f1ebebc2579";
let units = "metric";
let lat;
let lng;
let weatherDataUrl;
let oneCallUrl;
let currentTemperature;

let weatherPeriodWrapper = document.querySelector(".weather-period-wrapper");
let changeTemperatureUnitWrapper = document.querySelector(".temperature-btns-wrapper");
let searchCityForm = document.querySelector("#search-city-form");
let currentLocationButton = document.querySelector("#current-location-button");
let celsiusBtn = document.querySelector("#celsius-btn");
let fahrenheitBtn = document.querySelector("#fahrenheit-btn");
let currentTemperatureElement = document.querySelector("#current-temperature");
let currentTemperatureScale = document.querySelector("#current-temperature-scale");

searchCityForm.addEventListener("submit", handleSubmit);
currentLocationButton.addEventListener("click", getCurrentPosition);
celsiusBtn.addEventListener("click", convertToCelsius);
fahrenheitBtn.addEventListener("click", convertToFahrenheit);
changeTemperatureUnitWrapper.addEventListener("click", addActiveClass);
weatherPeriodWrapper.addEventListener("click", addActiveClass);


function convertToCelsius() {
    currentTemperatureElement.innerHTML = currentTemperature;
    currentTemperatureScale.innerHTML = "°C";
}

function convertToFahrenheit() {
    let temperature = Math.round((currentTemperature * 9 / 5) + 32);
    currentTemperatureElement.innerHTML = temperature;
    currentTemperatureScale.innerHTML = "°F";
}

function hideGaugeNumber(gauge, value) {
    let gaugeNumberThree = gauge.querySelector(".three-uv");
    let gaugeNumberSix = gauge.querySelector(".six-uv");
    let gaugeNumberNine = gauge.querySelector(".nine-uv");
    let gaugeNumberTwelve = gauge.querySelector(".twelve-uv");

    function hideElement(element) {
        element.style.display = "none";
    }

    if (value >= 3) {
        hideElement(gaugeNumberThree);
    }
    if (value >= 6) {
        hideElement(gaugeNumberSix);
    }
    if (value >= 9) {
        hideElement(gaugeNumberNine);
    }
    if (value >= 12) {
        hideElement(gaugeNumberTwelve);
    }
}

function setGaugeValue(value) {
    let gauge = document.querySelector(".gauge");
    let gaugeFill = gauge.querySelector(".gauge-fill");
    let gaugeText = gauge.querySelector(".gauge-text");

    let maxUvIndex = 15;
    let maxTurn = 0.5;
    let maxPercent = 100;

    let turnsInOnePercent = maxTurn / maxPercent;
    let percentsInOneUv = maxPercent / maxUvIndex;
    let turnsInOneUv = percentsInOneUv * turnsInOnePercent;

    if (value < 0 || value > 15) {
        return;
    }

    hideGaugeNumber(gauge, value);
    gaugeFill.style.transform = `rotate(${value * turnsInOneUv}turn)`;
    gaugeText.textContent = `${value}`;
}

function setVerticalGauge(value, maxValue, element) {
    let gaugeHeight = 38;
    let pxInOnePercent = gaugeHeight / 100;
    let valueInPercents = (value * 100) / maxValue;
    let valueInPx = pxInOnePercent * valueInPercents;
    let indent = Math.round(gaugeHeight - valueInPx);
    element.style.transform = `translateY(${indent}px)`;
}

function removeActiveClass(element) {
    let previousSibling = element.previousElementSibling;
    let nextSibling = element.nextElementSibling;
    if (previousSibling) {
        previousSibling.classList.remove("active");
    } else {
        nextSibling.classList.remove("active");
    }
}

function addActiveClass(event) {
    let element = event.target;
    removeActiveClass(element);
    element.classList.add("active");
}

function formatTime24H(time) {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    time = `${hours}:${minutes}`;
    return time;
};

function formatTime12H(time) {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let partOfTheDay;

    if (hours > 12) {
        hours = `${hours - 12}`;
        partOfTheDay = "PM";
    } else {
        partOfTheDay = "AM";
    }

    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    time = `${hours}:${minutes} ${partOfTheDay}`;
    return time
}

function showCurrentDate() {
    let currentWeekDay = document.querySelector("#current-week-day");
    let currentTime = document.querySelector("#current-time");
    let weekDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    let weekDay = weekDays[currentDate.getDay()];
    let time = formatTime24H(currentDate);
    currentWeekDay.innerHTML = `${weekDay},`;
    currentTime.innerHTML = `${time}`;
}

showCurrentDate();

function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(generateLink);

    function generateLink(response) {
        lat = response.coords.latitude;
        lng = response.coords.longitude;
        defineCityByCoordinates(lat, lng);
        getOneCallUrl(lat, lng);
    }
}

function handleSubmit(event) {
    event.preventDefault();

    let searchCityInput = document.querySelector("#search-city-input");
    let city = searchCityInput.value;

    defineCoordinatesByCity(city);
    searchCityInput.value = "";
}

function defineCoordinatesByCity(city) {
    weatherDataUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;

    function getCurrentCityCoordinates(response) {
        lat = response.data.coord.lat;
        lng = response.data.coord.lon;
        getOneCallUrl(lat, lng);
    }

    axios.get(weatherDataUrl).then(displayLocationName);
    axios.get(weatherDataUrl).then(getCurrentCityCoordinates);
}

function defineCityByCoordinates(lat, lng) {
    weatherDataUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=${units}&appid=${apiKey}`;
    axios.get(weatherDataUrl).then(displayLocationName);
}

function displayLocationName(response) {
    let city = response.data.name;
    let cityElement = document.querySelector("#city");
    let countryCode = response.data.sys.country;
    let countryNameUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;

    function getCountryFullName(response) {
        let countryElement = document.querySelector("#country");
        let country = response.data[0].name.common;
        countryElement.innerHTML = country;
    }

    cityElement.innerHTML = city;
    axios.get(countryNameUrl).then(getCountryFullName);
}

function getOneCallUrl(lat, lng) {
    oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely&appid=${apiKey}&units=${units}&exclude=minutely`;
    axios.get(oneCallUrl).then(displayWeather);
}

function getCurrentTemperature(response) {
    let temperatureElement = document.querySelector("#current-temperature");
    currentTemperature = Math.round(response.data.current.temp);
    temperatureElement.innerHTML = currentTemperature;
}

function getCloudinessInfo(response) {
    let cloudiness = response.data.current.weather[0].description;
    let cloudinessElement = document.querySelector("#cloudiness");
    cloudinessElement.innerHTML = cloudiness;
};

function getFeelsLikeInfo(response) {
    let feelsLikeElement = document.querySelector("#feels-like");
    let feelsLikeTemperature = Math.round(response.data.current.feels_like);
    feelsLikeElement.innerHTML = `Feels like ${feelsLikeTemperature}°`;
}

function getUvi(response) {
    console.log(response);
    let uvi = Math.round(response.data.current.uvi);
    let uvElement = document.querySelector("#uv-index");
    uvElement.innerHTML = uvi;
    return setGaugeValue(uvElement.innerHTML);
}

function getWindStatus(response) {
    let windDeg = response.data.current.wind_deg;
    let windSpeed = response.data.current.wind_speed;
    let windSpeedElement = document.querySelector("#wind-speed");
    windSpeedElement.innerHTML = windSpeed;
    defineWindDirrection(windDeg);
}

function getSunriseSunsetTime(response) {
    let sunriseElement = document.querySelector("#sunrise-time");
    let sunsetElement = document.querySelector("#sunset-time");

    let sunrise = new Date(response.data.current.sunrise * 1000);
    let sunset = new Date (response.data.current.sunset * 1000);

    sunrise = formatTime12H(sunrise);
    sunset = formatTime12H(sunset);

    sunriseElement.innerHTML = sunrise;
    sunsetElement.innerHTML = sunset;
}

function getHumidity(response) {
    let humidity = response.data.current.humidity;
    let maxHumidity = 100;

    let humidityElement = document.querySelector("#humidity");
    let humidityGaugeCircleElement = document.querySelector("#humidity-gauge-circle");

    humidityElement.innerHTML = humidity;

    function defineQualityName(index) {
        let qualityName;
        let qualityNameElement = document.querySelector("#humidity-quality-name");

        if (index < 15) {
            qualityName = "Too Dry";
        } else if (index > 50) {
            qualityName = "Too Humid";
        } else {
            qualityName = "Normal";
        }

        qualityNameElement.innerHTML = qualityName;
    }

    function defineEmoji(index) {
        let emoji;
        let emojiElement = document.querySelector("#humidity-emoji");

        if (index < 15 || index > 50) {
            emoji = "thums-down.svg"
        } else {
            emoji = "thums-up.svg"
        }

        let emojiLink = `img/icons/emoji/${emoji}`;
        emojiElement.src = `${emojiLink}`;
    }

    defineQualityName(humidityElement.innerHTML);
    defineEmoji(humidityElement.innerHTML);
    setVerticalGauge(humidityElement.innerHTML, maxHumidity, humidityGaugeCircleElement);
}

function getVisibility(response) {
    let mInKm = 1000;
    let visibility = response.data.current.visibility / mInKm;
    let visibilityElement = document.querySelector("#visibility");
    visibilityElement.innerHTML = visibility;

    function defineQualityNameAndEmoji(value) {
        let qualityName;
        let emoji;
        let qualityNameElement = document.querySelector("#visibility-quality-name");
        let emojiElement = document.querySelector("#visibility-emoji");

        if (value < 0.5) {
            qualityName = "Very poor";
            emoji = "frowning-face.svg";
        } else if (value >= 0.5 && value < 2) {
            qualityName = "Poor";
            emoji = "slightly-frowning-face.svg";
        } else if (value >= 2 && value < 10) {
            qualityName = "Average";
            emoji = "neutral-face.svg"
        } else {
            qualityName = "Good";
            emoji = "smiling-face.svg"
        }

        let emojiLink = `img/icons/emoji/${emoji}`;
        qualityNameElement.innerHTML = qualityName;
        emojiElement.src = emojiLink;
    }

    defineQualityNameAndEmoji(visibilityElement.innerHTML)
}

function getIcon(response, element) {
    let iconName = response.data.current.weather[0].icon;
    if (checkForMissingIcon(iconName) !== false) {
        iconName = checkForMissingIcon(iconName);
    }

    let src = `img/icons/day/${iconName}.svg`;
    element.setAttribute("src", src);
}

function defineWindDirrection(deg) {
    let windDirrection;
    let rotationDegree;
    let compasElement = document.querySelector(".compass");
    let windDirrectionElement = document.querySelector("#wind-dirrection")

    if (deg > 348.75 && deg <= 11.25) {
        windDirrection = "N"
        rotationDegree = -46;
    } else if (deg > 11.25 && deg <= 33.75) {
        windDirrection = "NNE"
        rotationDegree = -23.5;
    } else if (deg > 33.75 && deg <= 56.25) {
        windDirrection = "NE"
        rotationDegree = -1;
    } else if (deg > 56.25 && deg <= 78.75) {
        windDirrection = "ENE"
        rotationDegree = 21.5;
    } else if (deg > 78.75 && deg <= 101.25) {
        windDirrection = "E"
        rotationDegree = 44;
    } else if (deg > 101.25 && deg <= 123.75) {
        windDirrection = "ESE"
        rotationDegree = 66.5;
    } else if (deg > 123.75 && deg <= 146.25) {
        windDirrection = "SE"
        rotationDegree = 89;
    } else if (deg > 146.25 && deg <= 168.75) {
        windDirrection = "SSE"
        rotationDegree = 111.5;
    } else if (deg > 168.75 && deg <= 191.25) {
        windDirrection = "S"
        rotationDegree = 134;
    } else if (deg > 191.25 && deg <= 213.75) {
        windDirrection = "SSW"
        rotationDegree = 156.5;
    } else if (deg > 213.75 && deg <= 236.25) {
        windDirrection = "SW"
        rotationDegree = 179;
    } else if (deg > 236.25 && deg <= 258.75) {
        windDirrection = "WSW"
        rotationDegree = 201.5;
    } else if (deg > 258.75 && deg <= 281.25) {
        windDirrection = "W"
        rotationDegree = 224;
    } else if (deg > 281.25 && deg <= 303.75) {
        windDirrection = "WNW"
        rotationDegree = 246.5;
    } else if (deg > 303.75 && deg <= 326.25) {
        windDirrection = "NW"
        rotationDegree = 269;
    } else {
        windDirrection = "NNW"
        rotationDegree = 291.5;
    }

    windDirrectionElement.innerHTML = windDirrection;
    compasElement.style.transform = `rotate(${rotationDegree}deg)`;
}

function getAirQualityData() {
    let link = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    axios.get(link).then(showAirQuality);
}

function showAirQuality(response) {
    let airQualityIndexElement = document.querySelector("#air-quality-index");
    let airQualityGaugeCircle = document.querySelector("#air-quality-gauge-circle");

    let maxAirQualityIndex = 5;
    let airQualityIndex = response.data.list[0].main.aqi;
    airQualityIndexElement.innerHTML = airQualityIndex;

    function defineQualityName(index) {
        let qualityNames = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy"];
        let airQualityNameElement = document.querySelector("#air-quality-name");
        let qualityNameIndex = [index - 1];

        airQualityNameElement.innerHTML = qualityNames[qualityNameIndex];
    }

    function defineEmoji(index) {
        let emoji;
        let emojiElement = document.querySelector("#air-quality-emoji");

        if (index <= 2) {
            emoji = "thums-up.svg"
        } else {
            emoji = "thums-down.svg";
        }

        let imageLink = `img/icons/emoji/${emoji}`;
        emojiElement.src = `${imageLink}`;
    }

    defineQualityName(airQualityIndexElement.innerHTML);
    defineEmoji(airQualityIndexElement.innerHTML);
    setVerticalGauge(airQualityIndexElement.innerHTML, maxAirQualityIndex, airQualityGaugeCircle);
}

function checkForMissingIcon(iconName) {
    if (iconName === "04d") {
        return iconName = "03d";
    }

    if (iconName === "04n") {
        return iconName = "03n";
    }

    if (iconName === "10d") {
        return iconName = "11d";
    }

    if (iconName === "10n") {
        return iconName = "11n";
    }
    return false;
}

function formatDay(timestamp) {
    let date = new Date(timestamp * 1000);
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let dayIndex = date.getDay();

    return days[dayIndex];
}

function displayWeekForecast(response) {
    let forecast = response.data.daily;
    let weekForecastHtml;
    let forecastInfoElement = document.querySelector("#forecast-info");

    weekForecastHtml = `<div id="period-weather-information-wrapper">`;

    forecast.forEach((forecastDay, index) => {
        if (index < 7) {
            let iconName = forecastDay.weather[0].icon;
            let weatherDescription = forecastDay.weather[0].description;
            let weekDay = forecastDay.dt;
            let maxTemperature = Math.round(forecastDay.temp.max);
            let minTemperature = Math.round(forecastDay.temp.min);
            if (checkForMissingIcon(iconName) !== false) {
                iconName = checkForMissingIcon(iconName);
            }
            weekForecastHtml =  weekForecastHtml + `
                                 <div class="part-of-period-information">
                                     <div class="day sub-title">${formatDay(weekDay)}</div>
                                     <div class="icon">
                                     <img
                                          src="./img/icons/day/${iconName}.svg"
                                          alt=""
                                     />
                                     </div>
                                     <div class="temperature">
                                     <span class="temperature max main-text">
                                        ${maxTemperature}°
                                     </span>
                                     <span class="temperature min main-text">
                                         ${minTemperature}°
                                     </span>
                                     </div>
                                 </div>
            `;
        }
    })

    weekForecastHtml = weekForecastHtml + `</div>`;

    forecastInfoElement.innerHTML = weekForecastHtml;
    // for (let i = 0; i < numberOfItems; i++) {
    //     let itemInfo = forecast[i];
    //     let iconName = itemInfo.weather[0].icon;
    //     let weatherDescription = itemInfo.weather[0].description;
    //     let weekDay = itemInfo.dt;
    //     let maxTemperature = Math.round(itemInfo.temp.max);
    //     let minTemperature = Math.round(itemInfo.temp.min);
    //     if (checkForMissingIcon(iconName) !== false) {
    //         iconName = checkForMissingIcon(iconName);
    //     }
    //     console.log(iconName);
    //     weekForecastHtml = `
    //                                 <div class="part-of-period-information">
    //                                 <div class="day sub-title">${weekDay}</div>
    //                                 <span>${i}</span>
    //                                 <div class="icon">
    //                                     <img
    //                                         src="./img/icons/day/${iconName}.svg"
    //                                         alt=""
    //                                     />
    //                                 </div>
    //                                 <div class="temperature">
    //                                     <span class="temperature max main-text">
    //                                         ${maxTemperature}°
    //                                     </span>
    //                                     <span class="temperature min main-text">
    //                                         ${minTemperature}°
    //                                     </span>
    //                                 </div>
    //                             </div>
    //     `;
    //     if (i>0) {
    //         weekForecastHtml = weekForecastHtml + weekForecastHtml;
    //     }
    // }
    // forecastWrapperElement.innerHTML = weekForecastHtml;

}


function displayWeather(response) {
    let currentWeatherIconElement = document.querySelector("#current-weather-icon");
    getCurrentTemperature(response);
    getCloudinessInfo(response);
    getFeelsLikeInfo(response);
    getUvi(response);
    getWindStatus(response);
    getSunriseSunsetTime(response);
    getHumidity(response);
    getVisibility(response);
    getIcon(response, currentWeatherIconElement);
    getAirQualityData();
    displayWeekForecast(response);
}


// function displayWeekForecast() {
//     displayWeekForecastItem();
// }
defineCoordinatesByCity("Hamburg");


// axios.get("https://restcountries.com/v3.1/alpha/de").then(response => console.log(response));
// axios.get("https://api.unsplash.com/search/photos?query=kiev&client_id=qZUf4YHv469wMjMspUsOG_u6G2IXOPCEPV58jZFV4v4&order_by=relevant&content_filter=high&orientation=landscape").then(response => console.log(response));
// unsplash.photos.getPhoto("Hamburg");
// let apiKey = "80bcfdf92d669033bb9c4010046d2d86";
// let city = "Sydney";
// let units = "metric";
// let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;

// axios.get(url).then((response) => console.log(response));

// function showWeather(response) {
//   let temperatute = response.data.main.temp;
//   let h1Element = document.querySelector("h1");


// axios.get(url).then(showWeather);
