var myApiKey = "33ee13eb1ad0589899e3faf3934a18cd";
//var myApiKey = "67dc1da0e87fc4309781f7ea819be879";
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

function validateZipCode(elementValue){
    var zipCodePattern = /^\d{5}$|^\d{5}-\d{4}$/;
     return zipCodePattern.test(elementValue);
}

function DisplayWeather() {
    var zipCode = $('#txtZipCode').val();
    if (!validateZipCode(zipCode)) {return;}
    GetWeather();
}

function DisplayWeatherByLocation() {
    GetWeatherByLocation();
    GetForecastByLocation();
}

function LastSearchButtonClick(value) {
    //Populates zip code textbox and displays weather
    $('#txtZipCode').val(value);
    DisplayWeather();
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
    //var time = date + ' ' + month + ' ' + year;
    var time = month + ' ' + date + ' ' + year;
    return time;
}