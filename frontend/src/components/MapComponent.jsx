// Frontend: MapComponent.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import axios from "axios";
import "./MapComponent.css";

const MapComponent = () => {
  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startAddress, setStartAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [area, setArea] = useState(null);
  const [distance, setDistance] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [route, setRoute] = useState([]);

  const geocodeLocation = async (address, setLocation) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location", error);
    }
  };

  const LocationMarker = ({ setLocation }) => {
    useMapEvents({
      click(e) {
        setLocation(e.latlng);
      },
    });
    return null;
  };

  const switchLocations = () => {
    setStartLocation(destination);
    setDestination(startLocation);
    setStartAddress(destinationAddress);
    setDestinationAddress(startAddress);
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // const calculateMetrics = async () => {
  //   if (!startLocation || !destination) {
  //     setPopupMessage("Select or enter both locations to calculate metrics");
  //     return;
  //   }
  //   try {
  //     const response = await axios.post("http://localhost:5000/calculate-metrics", {
  //       start: startLocation,
  //       destination,
  //     });
  //     setArea(response.data.area);
  //     setDistance(response.data.distance);
  //     setPopupMessage(`Distance: ${response.data.distance} km, Area: ${response.data.area} sq km`);
  //   } catch (error) {
  //     console.error("Error calculating metrics", error);
  //   }
  // };

  // const fetchRoute = async () => {
  //   if (!startLocation || !destination) {
  //     setPopupMessage("Select or enter both locations to calculate metrics");
  //     return;
  //   }
  //   try {
  //     const response = await axios.get(
  //       `https://router.project-osrm.org/route/v1/driving/${startLocation.lng},${startLocation.lat};${destination.lng},${destination.lat}?geometries=geojson`
  //     );

  //     const coordinates = response.data.routes[0].geometry.coordinates;
  //     const mappedRoute = coordinates.map((coord) => ({
  //       lat: coord[1],
  //       lng: coord[0],
  //     }));

  //     setRoute(mappedRoute);
  //     setPopupMessage(`Route calculated successfully`);
  //   } catch (error) {
  //     console.error("Error fetching route", error);
  //     setPopupMessage("Failed to calculate route");
  //   }
  // };

  const calculateMetrics = async () => {
    if (!startLocation || !destination) {
      setPopupMessage("Select or enter both locations to calculate metrics");
      return;
    }
    try {
      const response = await axios.post("https://map-appn-leaflet-bk3.vercel.app/calculate-metrics", {
        start: startLocation,
        destination,
      });
      setArea(response.data.area);
      setDistance(response.data.distance);
      setPopupMessage(`Distance: ${response.data.distance} km, Area: ${response.data.area} sq km`);
    } catch (error) {
      console.error("Error calculating metrics", error);
      setPopupMessage("Failed to calculate metrics");
    }
  };
  
  const fetchRoute = async () => {
    if (!startLocation || !destination) {
      setPopupMessage("Select or enter both locations to calculate metrics");
      return;
    }
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startLocation.lng},${startLocation.lat};${destination.lng},${destination.lat}?geometries=geojson`
      );
  
      const coordinates = response.data.routes[0].geometry.coordinates;
      const mappedRoute = coordinates.map((coord) => ({
        lat: coord[1],
        lng: coord[0],
      }));
  
      setRoute(mappedRoute);
      setPopupMessage((prevMessage) => prevMessage + ` | Route calculated successfully`);
    } catch (error) {
      console.error("Error fetching route", error);
      setPopupMessage("Failed to calculate route");
    }
  };
  

  return (
    <div className="map-container">
      <div className="input-controls">
        <input
          type="text"
          placeholder="Enter start location"
          value={startAddress}
          onChange={(e) => setStartAddress(e.target.value)}
        />
        <button onClick={() => geocodeLocation(startAddress, setStartLocation)}>📍 Set Start</button>
      </div>
      <div className="input-controls">
        <input
          type="text"
          placeholder="Enter destination"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />
        <button onClick={() => geocodeLocation(destinationAddress, setDestination)}>📍 Set Destination</button>
      </div>
      <div className="controls">
        <button className="btn" onClick={switchLocations}>🔄 Switch Locations</button>
        <button className="btn primary" onClick={async () => {
  await calculateMetrics();  // Wait until metrics calculation completes
  await fetchRoute();        // Then fetch the route
}}>
  📏 Calculate Distance & Area
</button>

        <button className="btn location" onClick={fetchCurrentLocation}>📍 Get Current Location</button>
      </div>
      <p className="message">{popupMessage}</p>
      <div className="map-wrapper">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {startLocation && <Marker position={startLocation}><Popup>Start</Popup></Marker>}
          {destination && <Marker position={destination}><Popup>Destination</Popup></Marker>}
          {currentLocation && <Marker position={currentLocation}><Popup>Current Location</Popup></Marker>}
          {route.length > 0 && <Polyline positions={route} color="blue" />}
          <LocationMarker setLocation={setStartLocation} />
          <LocationMarker setLocation={setDestination} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;
