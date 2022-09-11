let currentDate = new Date();
let apiKey = "c95d60a1e3adbeb286133f1ebebc2579";
let units = "metric";
let lat;
let lng;
let link;
let searchCityForm = document.querySelector("#search-city-form");
let currentLocationButton = document.querySelector("#current-location-button");

searchCityForm.addEventListener("submit", handleSubmit);
currentLocationButton.addEventListener("click", getCurrentPosition);

let gaugeElement = document.querySelector(".gauge");

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
    let pxInOnePercent = gaugeHeight/100;
    let valueInPercents = (value*100) / maxValue;
    let valueInPx = pxInOnePercent*valueInPercents;
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

let changeTemperatureUnitWrapper = document.querySelector(
    ".change-temperature-unit-wrapper"
);
let weatherPeriodWrapper = document.querySelector(".weather-period-wrapper");

changeTemperatureUnitWrapper.addEventListener("click", addActiveClass);
weatherPeriodWrapper.addEventListener("click", addActiveClass);

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

function getCurrentPosition () {
    navigator.geolocation.getCurrentPosition(generateLink);
    
    function generateLink (response) {
        lat = response.coords.latitude;
        console.log(lat);
        lng = response.coords.longitude;
        console.log(lng);
        generateLinkByLocation(lat, lng);
    }  
}

function handleSubmit(event) {
    event.preventDefault();

    let searchCityInput = document.querySelector("#search-city-input");
    let city = searchCityInput.value;

    generateLinkByCity(city);
    searchCityInput.value = "";
}


function generateLinkByCity(city) {
    link = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;

    axios.get(link).then(getLocationName);
    axios.get(link).then(defineCoordinates);
    axios.get(link).then(showWeather);
}

function generateLinkByLocation(lat, lng) {
    link = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=${units}&appid=${apiKey}`;
    
    axios.get(link).then(getLocationName);
    axios.get(link).then(showWeather);
}

function defineCoordinates(response) {
    lat = response.data.coord.lat;
    lng = response.data.coord.lon;
}

function getLocationName(response) {
    let city = response.data.name;
    let countryCode = response.data.sys.country;
    let link = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    let cityElement = document.querySelector("#city");
    
    cityElement.innerHTML = city;
    axios.get(link).then(getCountryFullName);
}

function getCountryFullName(response) {
    let countryElement = document.querySelector("#country");
    console.log(countryElement);
    let country = response.data[0].name.common;
    console.log(country);
    countryElement.innerHTML = country;
}

function showWeather(response) {
    showCurrentTemperature(response);
    showCloudiness(response);
    showFeelsLikeTemperature(response);
    processUvIndex(response);
    showWindStatus(response);
    showSunriseSunsetTime(response);
    showHumidity(response);
    showVisibility(response);
    getAirQualityData();
}

function showCloudiness(response) {
    let cloudiness = response.data.weather[0].description;
    let cloudinessElement = document.querySelector("#cloudiness");
    cloudinessElement.innerHTML = capitalizeFirstLetter(cloudiness);
}

function showFeelsLikeTemperature(response) {
    let feelsLikeElement = document.querySelector("#feels-like");
    let feelsLikeTemperature = Math.round(response.data.main.feels_like);
    feelsLikeElement.innerHTML = `Feels like ${feelsLikeTemperature}°`;
}

function capitalizeFirstLetter(string) {
    let array = string.split(" ");

    for (let i = 0; i < array.length; i++) {
        let element = array[i];
        let firstChar = element.charAt(0);
        let restOfElement = element.slice(1);
        element = firstChar.toUpperCase() + restOfElement.toLowerCase();
        array.splice(i, 1, element);
    }
    return array.join(" ");
}

function showCurrentTemperature(response) {
    let temperatute = Math.round(response.data.main.temp);
    let temperatureElement = document.querySelector(".current-temperature");
    temperatureElement.innerHTML = temperatute;
}

function processUvIndex(response) {
    let uv;
    let options = {
        method: "GET",
        url: `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}dt=${currentDate}`,
        headers: {
            "x-access-token": "fcbdcf41e5c0fc5500e20be49e01c7bf",
        },
    };

    function showUV(uv) {
        let uvElement = document.querySelector("#uv-index");
        uvElement.innerHTML = uv;
        setGaugeValue(uvElement.innerHTML);
    }

    axios.request(options).then((response) => {
        uv = Math.round(response.data.result.uv);
        showUV(uv);
    }).catch(() => {
        uv = 3;
        showUV(uv);
    });
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
        rotationDegree = -23,5;
    } else if (deg > 33.75 && deg <= 56.25) {
        windDirrection = "NE"
        rotationDegree = -1;      ;
    } else if (deg > 56.25 && deg <= 78.75) {
        windDirrection = "ENE"
        rotationDegree = 21,5;        ;
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
        rotationDegree = 291,5;
    }

    windDirrectionElement.innerHTML = windDirrection;
    compasElement.style.transform = `rotate(${rotationDegree}deg)`;
}

function showWindStatus(response) {
    let windSpeed = response.data.wind.speed;
    let windSpeedElement = document.querySelector("#wind-speed");
    let windDirrection = response.data.wind.deg;

    windSpeedElement.innerHTML = windSpeed;
    defineWindDirrection(windDirrection);
}

function showSunriseSunsetTime(response) {
    let sunriseTimeElement = document.querySelector("#sunrise-time");
    let sunsetTimeElement = document.querySelector("#sunset-time");

    let sunriseTime = new Date(response.data.sys.sunrise * 1000);
    let sunsetTime = new Date(response.data.sys.sunset * 1000);
    
    sunriseTime = formatTime12H(sunriseTime);
    sunsetTime = formatTime12H(sunsetTime);

    sunriseTimeElement.innerHTML = sunriseTime;
    sunsetTimeElement.innerHTML = sunsetTime;
}

function showHumidity(response) {
    let humidityElement = document.querySelector("#humidity");
    let humidityGaugeCircleElement = document.querySelector("#humidity-gauge-circle");

    let maxHumidity = 100;
    let humidity = response.data.main.humidity;

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

function showVisibility(response) {
    let mInKm = 1000;
    let visibility = response.data.visibility / mInKm;
    let visibilityElement = document.querySelector("#visibility");
    visibilityElement.innerHTML = visibility;

    function defineQualityNameAndEmoji(value) {
        let qualityName;
        let emoji;
        let qualityNameElement = document.querySelector("#visibility-quality-name");
        let emojiElement = document.querySelector("#visibility-emoji");

        if (value < 0.5 ) {
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

function getAirQualityData() {
    let link = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`;
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
        let qualityNameIndex = [index-1];
    
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

generateLinkByCity("Hamburg");


// 👨‍🏫 Your task
// In your project, when a user searches for a city (example: New York),
// it should display the name of the city on the result page and the current
// temperature of the city.

// axios.get(url).then(showWeather);

// Please note: there's no need to include a temperature conversion at the moment.
// This will be taught later on in the course.

// 🙀 Bonus point:
// Add a Current Location button. When clicking on it, it uses the Geolocation API
//  to get your GPS coordinates and display and the city and current temperature
// using the OpenWeather API.

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

//   h1Element.innerHTML = `It is ${temperatute} degrees in ${city}`;
// }

// axios.get(url).then(showWeather);
