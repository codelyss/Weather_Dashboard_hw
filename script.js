var myApiKey = "67dc1da0e87fc4309781f7ea819be879";
var WeatherAPI = "http://api.openweathermap.org/data/2.5/weather?zip={0},us&APPID={1}&units=imperial";
var WeatherLocationAPI = "http://api.openweathermap.org/data/2.5/weather?lat={0}&lon={1}&APPID={2}&units=imperial";
var ForecastAPI = "http://api.openweathermap.org/data/2.5/forecast?zip={0},us&APPID={1}&units=imperial";
var ForecastLocationAPI = "http://api.openweathermap.org/data/2.5/forecast?lat={0}&lon={1}&APPID={2}&units=imperial";
var IconURL = "http://openweathermap.org/img/wn/{0}@2x.png";

var latitude = 0;
var longitude = 0;

//Found this function online. Allows you to type strings in format of text = {0}{1} and pass
//arguments in the same order. Used to generate API URLs.
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

//When the page loads, we want to show last searches made by the user.
//And immediately display their last search results.
LoadLastSearches();
DisplayLastSearch();
GetLocation();

function validateZipCode(elementValue) {
    var zipCodePattern = /^\d{5}$|^\d{5}-\d{4}$/;
    return zipCodePattern.test(elementValue);
}

function DisplayWeather() {
    var zipCode = $('#txtZipCode').val();
    if (!validateZipCode(zipCode)) { return; }
    GetWeather();
    GetForecast();
    SaveSearch();
}

function DisplayWeatherByLocation() {
    GetWeatherByLocation();
    GetForecastByLocation();
}

function GetLocation() {
    var lsLatitude = localStorage.getItem("latitude");
    var lsLongitude = localStorage.getItem("longitude");
    if (lsLatitude == null && lsLongitude == null) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(LoadWeatherByPosition);
        } else {
            //Geolocation is not supported by this browser.
        }
    }
}

function LoadWeatherByPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    localStorage.setItem("longitude", longitude);
    localStorage.setItem("latitude", latitude);
    DisplayWeatherByLocation();
}

function DisplayLastSearch() {
    //This checks the localStorage to see if it has an item with key weatherSearches
    //If it does, it will populate the input textbox with the last search, and 
    //display the weather for that zip code.
    var searches = localStorage.getItem('weatherSearches');
    if (searches != null) {
        searches = searches.substring(0, searches.length - 1); //removing last ;
        var values = searches.split(";");
        $('#txtZipCode').val(values[values.length - 1]); //grabbing first element stored in localStorage
        DisplayWeather();
    }
}

function LoadLastSearches() {
    //This loads last x amount of searches and displays them
    //as clickable buttons that automatically show the weather
    //for the selected zip code

    var amountOfSearches = 8;
    $('#lastSearches').empty();
    var searches = localStorage.getItem('weatherSearches');
    if (searches != null) {
        $('#lastSearches').append("<h4>Last searches: </h4>");
        searches = searches.substring(0, searches.length - 1);
        var values = searches.split(";");
        var count = 0;

        for (i = values.length - 1; i >= 0; i--) {
            if (count == amountOfSearches) { break; }
            var x = values[i];
            var btn = $("<input />", {
                type: "button",
                class: "lastSearchButton",
                value: x,
                onclick: "LastSearchButtonClick('" + x + "')"
            });
            $('#lastSearches').append(btn);
            count++;
        }
    }
}

function LastSearchButtonClick(value) {
    //Populates zip code textbox and displays weather
    $('#txtZipCode').val(value);
    DisplayWeather();
}

function SaveSearch() {
    //Saving current zip code search in localStorage
    var zipCode = $('#txtZipCode').val();
    var value = zipCode + ";";
    var searches = localStorage.getItem('weatherSearches');
    if (searches != null && searches.includes(zipCode)) {
        searches = searches.replace(value, "");
    }
    var lsvalue = ((searches == null) ? value : searches + value);
    localStorage.setItem("weatherSearches", lsvalue);
    LoadLastSearches();
}

function OpenWeatherAPICurrentWeather() {
    //Provides correctly formatted WeatherAPI url
    var zipCode = $('#txtZipCode').val();
    var url = WeatherAPI.format(zipCode, myApiKey);
    return url;
}

function OpenWeatherAPICurrentWeatherByLocation() {
    var url = WeatherLocationAPI.format(latitude, longitude, myApiKey);
    return url;
}

function OpenWeatherAPIForecast() {
    //Provides correctly formatted ForecastAPI url
    var zipCode = $('#txtZipCode').val();
    return ForecastAPI.format(zipCode, myApiKey);
}

function OpenWeatherAPIForecastByLocation() {
    var url = ForecastLocationAPI.format(latitude, longitude, myApiKey);
    return url;
}

function GetIconURL(icon) {
    //Provides correctly formatted URL to retrieve the url from an icon
    var url = IconURL.format(icon);
    return url;
}

function GetWeather() {
    //Calls the weather API, and parses the results 
    //then uses JQuery to generate HTML to populate the page

    var apiURL = OpenWeatherAPICurrentWeather();
    $.getJSON(apiURL, function (results) {
        //console.log(JSON.stringify(results));
        DisplayWeatherResults(results);
    });
}

function GetWeatherByLocation() {
    var apiURL = OpenWeatherAPICurrentWeatherByLocation();
    $.getJSON(apiURL, function (results) {
        //console.log(JSON.stringify(results));
        DisplayWeatherResults(results);
    });
}

function DisplayWeatherResults(results) {
    var weather = results.weather[0];
    var condition = weather.main;
    var temperature = results.main.temp;
    var humidity = results.main.humidity;
    var windspeed = results.wind.speed;
    var description = weather.description;
    var cityName = results.name;
    var icon = results.weather[0].icon;
    var dt = results.dt;

    var disp = $('.weatherArea');
    disp.empty();

    var card = $("<div />");
    var iconImg = $("<img />", {
        src: GetIconURL(icon),
    });
    card.append(iconImg);
    var container = $("<div />").addClass("container");
    card.append(container);
    container.append("<h2>" + cityName + "</h2>");
    container.append("<h3>" + timeConverter(dt) + "</h3>");
    container.append("<p>" + condition + "</p>");
    container.append("<p>" + Math.round(temperature, 0) + String.fromCharCode(176) + "</p>"); //CharCode 176 = degree symbol
    container.append("<p>Humidity: " + humidity + "</p>");
    container.append("<p>Wind speed: " + windspeed + "</p>");
    disp.append(card);
}

function GetForecast() {
    //Calls the forecast API, and parses the results
    //then uses JQuery to generate HTML to populate the page

    var apiURL = OpenWeatherAPIForecast();
    $.getJSON(apiURL, function (results) {
        //console.log(JSON.stringify(results));

        DisplayForecastResults(results);
    });
}

function GetForecastByLocation() {
    var apiURL = OpenWeatherAPIForecastByLocation();
    $.getJSON(apiURL, function (results) {
        //console.log(JSON.stringify(results));

        DisplayForecastResults(results);
    });
}

function DisplayForecastResults(results) {
    var list = results.list;

    for (i = 0; i <= 4; i++) {
        var k = 7 * i + i;
        var dt = list[k].dt;
        //var condition = list[k].weather[0].main;
        //var description = list[k].weather[0].description;
        var temperature = Math.round(list[k].main.temp, 0);
        var humidity = list[k].main.humidity;
        var icon = list[k].weather[0].icon;
        var local_date = timeConverter(dt);

        var thisForecast = i + 1;
        var disp = $('.forecast' + thisForecast);
        disp.empty();

        var card = $("<div />").addClass("card");
        var iconImg = $("<img />", {
            src: GetIconURL(icon),
        });
        card.append(iconImg);
        var container = $("<div />").addClass("container");
        card.append(container);
        container.append("<h4>" + local_date + "</h4>");
        container.append("<p>" + temperature + String.fromCharCode(176) + "</p>");
        container.append("<p>Humidity: " + humidity + "</p>");
        disp.append(card);
    }
}

function timeConverter(UNIX_timestamp) {
    //Since date from OpenWeatherAPI is provided in UTC milliseconds format,
    //this function will convert it to a readable date format
    var a = new Date(UNIX_timestamp * 1000); //milliseconds to seconds
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = month + ' ' + date + ' ' + year;
    return time;
}