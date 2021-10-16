
/* =========================================================================================
 *                                                                                         *  
 *      JavaSript File                                                                     *
 *                                                                                         *
 *      Modifications by:  Mark Watson                                                     *
 *      1st issue Date:    25 September 2021                                               *
 *                                                                                         *
 *                                                                                         *
 * ======================================================================================= */

let cityNameButton  = document.getElementById( "submitButton" );
let cityName        = document.getElementById( "cityName" );

let userPrefTime = document.getElementsByName( "time" );
let userPrefTemp = document.getElementsByName( "temperature" );
let userPrefDate = document.getElementsByName( "date" );  

let storedPreferences = JSON.parse(localStorage.getItem("preferences"));

let openWeatherAPI  = "612169af0bfa912963083697b1c8d4cb";
let cityList        = $( "#cityList" );
let cityPersist     = $( ".city-persist" );

let cities          = [];
let userPref        = [];
let city;

/* ====================================================================================== */ 

initialise();

/* ====================================================================================== */ 

function initialise(){
  
  if (storedPreferences !== null) {  
    userPref = storedPreferences;
  } else {
    storedPrefs();
  }

  let storedCities = JSON.parse(localStorage.getItem("cities"));

  if (storedCities !== null) {
      cities = storedCities;
    }
    renderCities();

    city = JSON.parse(localStorage.getItem("lastPlaceChecked"));
    if(city !== null ) { getTodaysWeather( city );}
  }

/* ====================================================================================== */ 

function storedPrefs (){

  storedPreferences = JSON.parse(localStorage.getItem("preferences"));
  document.getElementById('id01').style.display="block";

  if (storedPreferences !== null) {  
    userPref = storedPreferences;

    if( userPref[0]!== null ){ 
      document.getElementById( userPref[0] ).checked      = true;
    } else {
      document.getElementById( "twentyFour" ).checked     = true;
    }

    if( userPref[1]!== null ){ 
      document.getElementById ( userPref[1] ).checked     = true;
    } else {
      document.getElementById( "metric" ).checked         = true;
    }

    if( userPref[2]!== null ){ 
      document.getElementById( userPref[2] ).checked      = true;
    } else {
      document.getElementById( "date-day" ).checked       = true;
    }
  } else { 
    createDefaultUserPref ();
  }
}

/* ====================================================================================== */ 

function createDefaultUserPref (){

  userPref[0] = "twentyFour";
  document.getElementById( "twentyFour" ).checked       = true;
  userPref[1] = "metric";
  document.getElementById( "metric" ).checked           = true;
  userPref[2] = "date-day";
  document.getElementById( "date-day" ).checked         = true;
  
  localStorage.setItem("preferences", JSON.stringify(userPref)); 
}

/* ====================================================================================== */ 

function renderCities() {
  cityList.empty();
  
  for ( let i = 0; i < cities.length; i++ ) {
    
    city = cities[i];

    let storedCity  = document.createElement("div");
    
    storedCity.classList    = "btn citySearched large dark-grey hover-light-grey col s10 margin-bottom-sml";
    storedCity.setAttribute("onclick", "cityPersistSelected( this )");
    storedCity.textContent  = city;
    cityList.prepend(storedCity);   

    let delButton = document.createElement("div");
    delButton.classList    = `btn delCity${i} delSelector icon-cross small dark-grey hover-light-grey col s2 margin-bottom-sml`;
    delButton.setAttribute("onclick", "deleteRecord( this )");
    delButton.setAttribute("style", "height: 2.65rem;");

    storedCity.insertAdjacentElement('afterend',delButton);

  }
}  

/* == Fetch data ================================================================================= */ 
  
// needed this API for city name search - I then pass the lat and lon to get the UV 
// and forecast.  I pass resulting latitude and longitude to the next Fetch.

function getTodaysWeather( chosenCity ) {
  // just in case a user finds a work a way around setting a preference - forcing default as metric.
  if (userPref[1] === undefined || userPref[1] === null ) { userPref[1] = "metric"} 
  let apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${chosenCity}&units=${userPref[1]}
  &appid=${openWeatherAPI}`;

  fetch( apiURL )

    .then(function ( response ) {
      if ( response.ok ) {
      response.json()

        .then(function ( data ) {

            console.log( data );
            let lat = data.coord.lat;
            let lon = data.coord.lon;
            let name = data.name;
            let country = data.sys.country;
            getTodayUV( lat, lon, name, country );

          });
          } else {
            alert("I can't find that city, check your spelling or possibly I just don't have data for that location.");
          } 
    });
};

let getTodayUV = function (lati, long, names, countries ) {
let apiUV = `https://api.openweathermap.org/data/2.5/onecall?lat=${lati}&lon=${long}
&units=${userPref[1]}&exclude=minutely,hourly&appid=${openWeatherAPI}`

  fetch( apiUV )

    .then(function ( response ) {
      if ( response.ok ) {
      response.json()

    .then(function ( data ) {
    console.log( data );
    renderWeather( data, names, countries );
    });
    } 
  });
};

/* ====================================================================================== */ 

// was unsure how best to pass the city and country code - I don't
// think this is the best way passing it through a script in between.
// I ran out of time to work it out, this still works.

function renderWeather( searchResults, place, placeCode ){

  let todayTime = searchResults.current.dt
  let dateFormat, timeFormat, speedFormat;
  
  // Thought I'd have a go with switch / case statements.  Think
  // they are a good choice for this situation.
  switch (userPref[0]) {  
    case "twentyFour": 
      timeFormat = "| HHmm [hours] ";
      break;
    
      case "twelve": 
      timeFormat = "| hh:mm A ";
      break;
    
    default:
      timeFormat = "| HHmm hours ";
      break;
  }

  switch (userPref[1]) {  
    case "metric": 
      tempFormat = "°C";
      speedFormat = "m/sec";
      break;
    
    case "imperial": 
      tempFormat = "°F";
      speedFormat = "mil/hr";
      break;
    
    case "standard": 
      tempFormat  = "Kelvin";
      speedFormat = "m/sec";
      break;

    default:
      tempFormat = "°C";
      speedFormat = "m/sec";
      break;
  }

  switch (userPref[2]) {  
    case "date-day": 
      dateFormat = "DD-MMM-YYYY ";
      break;
    
    case "date-month": 
      dateFormat = "MMM-DD-YYYY ";
      break;
    
    case "date-year": 
      dateFormat = "YYYY-MMM-DD ";
      break;

    default:
      dateFormat = "DD-MMM-YYYY ";
      break;
  }

  // ratings from: https://projectsunscreen.com/pages/todays-uv-index 
  let uvIndex = searchResults.current.uvi;
  let uvIndexRating, uvIndexColor;

  switch ( true )  {  
    case  (uvIndex < 3): 
      uvIndexRating   = "Low";
      uvIndexColor    = "green";
      uvIndexTxtColor = "white";
      break;
    
    case  (uvIndex < 6): 
      uvIndexRating = "Moderate";
      uvIndexColor = "yellow";
      uvIndexTxtColor = "black";
      break;
    
    case  (uvIndex < 8): 
      uvIndexRating = "High";
      uvIndexColor = "orange";
      uvIndexTxtColor = "white";
      break;

    case  (uvIndex < 11): 
      uvIndexRating = "Very High";
      uvIndexColor = "red";
      uvIndexTxtColor = "white";
      break;

    case  (uvIndex > 11): 
      uvIndexRating = "Extreme";
      uvIndexColor = "purple";
      uvIndexTxtColor = "white";
      break;

    default:
      console.log("Something has gone wrong");
      uvIndexRating = "Moderate";
      uvIndexColor = "yellow";
      uvIndexTxtColor = "black";
      break;
  }

  // === using the Fetch data to render the web page. ===============

  let unixFormat  = moment.unix(  todayTime  ).format(  dateFormat + timeFormat );

  let textBanner  = `${place}, ${placeCode} 
  at: ${unixFormat} (your local time)
  selected city timezone offset: ${searchResults.timezone_offset/3600} hours to Universal Time Coordinated (UTC)`;
  
  let weatherIconID       = searchResults.current.weather[0].icon;
  let weatherIcon         = document.getElementById(  "day0-icon" );
  let weatherDescription  = document.getElementById(  "day0-description"  );
  let weatherBanner       = document.getElementById(  "myHeader"  );

  weatherBanner.style.backgroundImage   = `url(./img/banner/${weatherIconID}.jpg)`;
  weatherBanner.style.backgroundRepeat  = `no-repeat`;
  weatherBanner.style.backgroundSize    = `cover`;

  weatherIcon.src = `./img/accuweather_icons/${weatherIconID}.png`
  weatherDescription.innerText = `${searchResults.current.weather[0].main} - ${searchResults.current.weather[0].description}`

  document.getElementById(  "city-searched" ).innerText         = textBanner;
  document.getElementById(  "today-temp"  ).innerText           = `${searchResults.current.temp.toFixed(1)} ${tempFormat}`;
  document.getElementById(  "today-wind"  ).innerText           = `${searchResults.current.wind_speed.toFixed(1)} ${speedFormat}`;
  document.getElementById(  "today-humidity"  ).innerText       = `${searchResults.current.humidity} %`;
  document.getElementById(  "today-uv"  ).innerText             = `${uvIndex.toFixed(1)}`;
  document.getElementById(  "today-uv-category" ).innerText     = `${uvIndexRating}`;
  document.getElementById(  "today-uv"  ).style.backgroundColor = `${uvIndexColor}`;
  document.getElementById(  "today-uv"  ).style.color           = `${uvIndexTxtColor}`

  
  for( let i=1; i<=7; i++){
    let elementID = "day"+ i +"-forecast";

    let forecastWeatherIconID             = searchResults.daily[i].weather[0].icon;
    let forecastWeatherMain               = searchResults.daily[i].weather[0].main;
    let forecastWeatherDescription        = searchResults.daily[i].weather[0].description;
    let forecastWeatherIcon               = document.getElementById(elementID).children[1].children[0];
    let weatherForecastDescription        = document.getElementById( `day${i}-description` );
    weatherForecastDescription.innerText  = `${forecastWeatherMain} - ${forecastWeatherDescription}`

    document.getElementById(  elementID ).children[0].innerText = moment.unix(searchResults.daily[i].dt).format("ddd, " + dateFormat);
    forecastWeatherIcon.src = `./img/accuweather_icons/${forecastWeatherIconID}.png`

    document.getElementById(  elementID ).children[2].children[0].innerText = searchResults.daily[i].temp.day.toFixed(1) +" " + tempFormat;
    document.getElementById(  elementID ).children[3].children[0].innerText = searchResults.daily[i].wind_speed.toFixed(1) +" " + speedFormat;
    document.getElementById(  elementID ).children[4].children[0].innerText = searchResults.daily[i].humidity +"% ";
  }
}

/* ====================================================================================== */ 

// I had to go back to unit4 activities 11-16 as
// other methods of doing this are deprecated - think this is
// best way to get the value.  It was an arrow function but I 
// reversed to full syntax until we do arrow functions.

cityName.addEventListener( "keyup", function cityEntered( event ){
  if (!event ) { event = window.event };
  if ( event.key === "Enter" ){
    if (!cityName.value) { 
      alert("I need a city name to search for weather conditions.");
      return false;
    }
    
    city = cityName.value;
    cities.push( city );

    storeCities();
    renderCities();

    console.log( city );
    getTodaysWeather( city );
    cityName.value = "";
  }
}, false);

/* ====================================================================================== */ 

// Decided I needed a button to make it mobile device friendly
// and I couldn't quickly work out how to tie this event with the 
// one return key event.

function buttonCityEntered( event ){
  if (  !cityName.value ) { 
    alert(  "I need a city name to search."  );
    return false;
  }
  
  city = cityName.value;
  
  cities.push( city );
  storeCities();
  renderCities();

  getTodaysWeather( city );
  cityName.value = "";
};

/* ====================================================================================== */ 

function cityPersistSelected( clicked_object ) {
  city = clicked_object.innerHTML;
  getTodaysWeather ( city );
};

/* ====================================================================================== */ 

// an idea of mine to allow users to delete individual
// cities to keep their list clean.
function deleteRecord( clicked_object ) {
  let str = clicked_object.classList[1];
  let strSpliced = str.slice( 7,str.length+1  );
  console.log( strSpliced );
  cities.splice( strSpliced, 1);
  storeCities();
  renderCities();
  
  return;
};

/* == User Preference Events ============================================================ */ 

function userTimePref( clicked_object ) {
      userPref[0] = clicked_object.id;   
      localStorage.setItem( "preferences", JSON.stringify( userPref )); 
      return;
};

function userTempPref( clicked_object ) {
  userPref[1] = clicked_object.id;   
  localStorage.setItem( "preferences", JSON.stringify( userPref )); 
  return;
};

function userDatePref( clicked_object ) {
  userPref[2] = clicked_object.id;   
  localStorage.setItem( "preferences", JSON.stringify(  userPref  )); 
  return;
};

/* ====================================================================================== */ 

function storeCities(){
  localStorage.setItem("cities", JSON.stringify(  cities  ));
}

function storeUserPref(){
  localStorage.setItem("preferences", JSON.stringify( userPref ));
}


// doing this so previous viewed city reloads with page reload.
window.onbeforeunload = function(){
  let lastPlace = city;
  localStorage.setItem("lastPlaceChecked", JSON.stringify(  lastPlace ));
}


/* ====================================================================================== 
   ====================================================================================== */ 