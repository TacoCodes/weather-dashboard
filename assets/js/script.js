// Variables to store jQuery objects for different elements on the page
var cityResultText = $("#cityResults");
var tempResultText = $("#tempResults");
var humidityResult = $("#humidResults");
var windResultText = $("#windResults");
// container for the main weather icon
var mIcon =$("#mIcon");
// container for the 5-day forecast cards
var cards = $("#Cards");
// container for the 5-day forecast title
var dayForecast = $("#fivedays");
// container for the current weather card
var cardDisplay = $("#weatherDispCard"); 
// container for the UV index
var UVIndexText = $("#UVInR");
// container for the list of previously searched cities
var buttonList = $("#butList");
// container for the list of previously searched cities
var forecastDate = {};
// variable to store the weather icon for each day of the forecast
var forecastIcon = {};
// variable to store the temperature for each day of the forecast
var forecastTemp = {};
// variable to store the humidity for each day of the forecast
var forecastHum = {};
// variable to store today's date, formatted using moment.js
var today = moment().format('DD' + "/" + 'MM' + '/' + 'YYYY');
// API key for OpenWeatherMap
var APIKey = "&units=metric&APPID=81f419e0fe135eddf455dec7205b8836";
// base URL for the current weather API
var url =  "https://api.openweathermap.org/data/2.5/weather?q=";
// array to store previously searched cities, retrieved from local storage
var citiesArray = JSON.parse(localStorage.getItem("Saved City")) || [];

// Event listener to run the following functions when the document is ready
$(document).ready(function (){
    // retrieves the last searched city from the array
    var userInput = citiesArray[citiesArray.length - 1];
    // calls the function to display the current weather for the city
    currentWeather(userInput);
    // calls the function to display the 5-day forecast for the city
    forecast(userInput);
    lastSearch ();

});
// Function to display the current weather for a given city
function currentWeather(userInput) {
    mIcon.empty(); // empties the main weather icon container
    // constructs the API url using the user input and API key
    var queryURL = url + userInput + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        var cityInfo = response.name;
        var country = response.sys.country; 
        var temp = response.main.temp;
        var humidity = response.main.humidity;
        var wind = response.wind.speed;
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        var icon = response.weather[0].icon;
        var UVindexURL = "https://api.openweathermap.org/data/2.5/uvi?" + "lat=" + lat + "&" + "lon=" + lon + "&APPID=81f419e0fe135eddf455dec7205b8836";
        // Creates an image element for the weather icon, and appends it to the mIcon container
        var newImgMain = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + icon + "@2x.png");
        mIcon.append(newImgMain);
        // Populates the various elements on the page with the retrieved weather data
        cityResultText.text(cityInfo + ", " + country + " " + today);
        tempResultText.text("Temperature: " + temp + " ºC");
        humidityResult.text("Humidity: " + humidity + " %");
        windResultText.text("Wind Speed: " + wind + " MPH");
        // Makes an ajax call to retrieve the UV index for the city
        $.ajax({
            url: UVindexURL,
            method: "GET"
        }).then(function(uvIndex){
            var UV = uvIndex.value;
            var colorUV;
            if (UV <= 3) {
                colorUV = "green";
            } else if (UV >= 3 & UV <= 6) {
                colorUV = "yellow";
            } else if (UV >= 6 & UV <= 8) {
                colorUV = "orange";
            } else {
                colorUV = "red";
            }
            UVIndexText.empty(); // empties the UV index container
            var UVResultText = $("<p>").attr("class", "card-text").text("UV Index: ");
            UVResultText.append($("<span>").attr("class", "uvindex").attr("style", ("background-color: " + colorUV)).text(UV))
            UVIndexText.append(UVResultText);
            cardDisplay.attr("style", "display: flex; width: 98%");
        })    
    })
    }

    // Function to display the 5-day forecast for a given city
function forecast (userInput) {
    // empties the 5-day forecast title container
    dayForecast.empty(); 
    // empties the 5-day forecast cards container
    cards.empty();
    var fore5 = $("<h2>").attr("class", "forecast white-text ").text("5 Days Forecast ");
    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + userInput + "&units=metric&APPID=81f419e0fe135eddf455dec7205b8836";
    $.ajax({
        url: forecastURL,
        method: "GET"
    }).then(function(response){
        for (var i = 0; i < response.list.length; i += 8){
            
            forecastDate[i] = response.list[i].dt_txt;
            forecastIcon[i] = response.list[i].weather[0].icon;
            forecastTemp[i] = response.list[i].main.temp; 
            forecastHum[i] = response.list[i].main.humidity;  
             // Create elements for the forecast cards and populate them with the forecast data
            var newCol2 = $("<div>").attr("class", "col-2");
            cards.append(newCol2);

            var newDivCard = $("<div>").attr("class", "card text-white bg-dark mb-3");
            newDivCard.attr("style", "max-width: 18rem;")
            newCol2.append(newDivCard);

            var newCardBody = $("<div>").attr("class", "card-body");
            newDivCard.append(newCardBody);

            var newH5 = $("<h5>").attr("class", "card-title").text(moment(forecastDate[i]).format("MMM Do"));
            newCardBody.append(newH5);

            var newImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + forecastIcon[i] + "@2x.png");
            newCardBody.append(newImg);

            var newPTemp = $("<p>").attr("class", "card-text").text("Temp: " + Math.floor(forecastTemp[i]) + "ºC");
            newCardBody.append(newPTemp);

            var newPHum = $("<p>").attr("class", "card-text").text("Humidity: " + forecastHum[i] + " %");
             // Append the elements to create the forecast cards
            newCardBody.append(newPHum);

            dayForecast.append(fore5);
            };
            })

        }

        // This function takes in user input and checks if it already exists in the "citiesArray"
        // If the input is not present in the array, it is added to the array and stored in local storage
function storeData (userInput) {
    // Get the user input and convert it to lowercase
    var userInput = $("#searchIn").val().trim().toLowerCase();
    var containsCity = false;
    // Check if the "citiesArray" is not null
    if (citiesArray != null) {
         // Iterate through the "citiesArray" and check if the user input matches any of the cities
		$(citiesArray).each(function(x) {
			if (citiesArray[x] === userInput) {
				containsCity = true;
			}
		});
	}
    // If the user input does not match any of the cities in the array, add it to the array
	if (containsCity === false) {
        citiesArray.push(userInput);
	}
    // Store the "citiesArray" in local storage
	localStorage.setItem("Saved City", JSON.stringify(citiesArray));

}

// This function creates buttons for each city in the "citiesArray" and adds them to the page
function lastSearch () {
    // Clear the button list
    buttonList.empty()
    // Iterate through the "citiesArray"
    for (var i = 0; i < citiesArray.length; i ++) {
        // Create a new button for each city
        var newButton = $("<button>").attr("type", "button").attr("class","savedBtn btn btn-info btn-lg btn-block");
        newButton.attr("data-name", citiesArray[i])
        newButton.text(citiesArray[i]);
        // Add the button to the button list
        buttonList.prepend(newButton);
    }
    // Add an event listener to each button
    $(".savedBtn").on("click", function(event){
        event.preventDefault();
        // When the button is clicked, call the "currentWeather" and "forecast" functions
        var userInput = $(this).data("name");
        currentWeather(userInput);
        forecast(userInput);
    })

}

// Add an event listener to the button with the class "btn"
$(".btn").on("click", function (event){
    // Check if the user input is empty
    event.preventDefault();
    if ($("#searchIn").val() === "") {
    alert("Please type a userInput to know the current weather");
    } else
     // Get the user input and convert it to lowercase
    var userInput = $("#searchIn").val().trim().toLowerCase();
     // Get the user input and convert it to lowercase
    currentWeather(userInput);
    forecast(userInput);
    storeData();
    lastSearch();
    // Clear the input field
    $("#searchIn").val("");

})