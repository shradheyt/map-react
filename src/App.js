import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {

  componentDidMount() {
    this.renderMap();
    
  }

  renderMap = () => {
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCpAwOhD9MaX9RNinoKze2fnvKSCO8TKT0&callback=initMap");
    window.initMap = this.initMap;
  }

  initMap = () => {

    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 17, lng: 78},
      zoom: 4
    });
    //Get User's Current Location
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition((position) => {
        var myLatLong = {lat: position.coords.latitude, lng: position.coords.longitude};
        console.log("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
        map.setCenter(myLatLong);
        map.setZoom(8); 
      });
    } else {
        alert("Geolocation is not supported by this browser.");
    }

    //Create Marker
    var marker = new window.google.maps.Marker({
      position: null,
      map: map
    }); 

    //Create InfoWindow 
    var infowindow = new window.google.maps.InfoWindow();
    var contentString = '';

    //Add event listener on Map
    window.google.maps.event.addListener(map,'click',function(event) {                
      marker.setPosition(event.latLng);
      var loc = `${event.latLng.lat()},${event.latLng.lng()}`;
      var date = new Date();
      var timestamp = date.getTime()/1000 + date.getTimezoneOffset() * 60;
      const apikey = 'AIzaSyDiCb7PL8xk8qwLTctxZ_Vpj-mSrsLyqGU';
      const apiKeyForWeather = '3d238a8df02df0edb3da0a5227b6aea0';
      var apiForTimezone = `https://maps.googleapis.com/maps/api/timezone/json?location=${loc}&timestamp=${timestamp}&key=${apikey}`;
      var apiForWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${event.latLng.lat()}&lon=${event.latLng.lng()}&APPID=${apiKeyForWeather}`;

      //Fetch date and time for given coordinates
      axios.get(apiForTimezone)
      .then(response => {
        let timeData = response.data;
        console.log(timeData);
        if(timeData.status === 'OK') {
          var offsets = timeData.dstOffset * 1000 + timeData.rawOffset * 1000;
          var localdate = new Date(timestamp * 1000 + offsets) 
          contentString = localdate.toLocaleString();          
        }  
          //Fetch Weather Details for given coordinates
          axios.get(apiForWeather)
          .then(response => {
            var weatherData = ` Weather Details:Temperature: ${response.data.main.temp} Pressure: ${response.data.main.pressure} Humidity: ${response.data.main.humidity} Min Temp: ${response.data.main.temp_min} Max Temp: ${response.data.main.temp_max}`;
            if(response.data.name !== "" && response.data.sys.country !== "")
              contentString += `  Place: ${response.data.name} Country: ${response.data.sys.country}`; 
            contentString += weatherData;            
            infowindow.setContent(JSON.stringify(contentString));
            infowindow.open(map,marker);
          })
          .catch(err => console.log(err));  
        })
        .catch(err => console.log(err)); 
    });
  }

  render() {
    return (
      <main>
        <div id="map"></div>
      </main>
      
    );
  }
}

/*
  @api loadScript
  @params url: String
  @desc Take url as input which needs to be added as in script tag.It will create script tag dynamically and add.
*/

function loadScript(url) {
  var index = window.document.getElementsByTagName("script")[0];
  var script = window.document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  index.parentNode.insertBefore(script, index);
}

export default App;
