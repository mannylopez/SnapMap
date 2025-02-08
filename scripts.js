document.addEventListener("DOMContentLoaded", function() {
  document.querySelector(".prev").addEventListener("click", prevPhoto);
  document.querySelector(".next").addEventListener("click", nextPhoto);

  // Set the starting latitude and longitude for the map
  let startingLatitude = 14.703322077338504
  let startingLongitude = -91.19012736568094
  
  let mediaItems = [];
  let currentIndex = 0;
  
  const mediaContainer = document.getElementById('photo-container');

  // Initialize map and set zoom level
  var map = L.map('map').setView([startingLatitude, startingLongitude], 11);

  // Free basemaps can be found at https://alexurquhart.github.io/free-tiles/
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Fetch the JSON file and populate the mediaItems array
  fetch('./data/media.json')
    .then(response => response.json())
    .then(data => {
      mediaItems = data.media.map(item => ({
        src: `./images/${item.filename}`,
        type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        description: item.description
      }));
      
      
      if (mediaItems.length > 0) {
        showMedia(currentIndex); // Show first photo after loading
      }
  })
  .catch(error => console.error('Error loading JSON:', error));

  function showMedia(index) {
    mediaContainer.innerHTML = '';
    const item = mediaItems[index];
    console.log(item, index)
    
    // Add GPX
    if (item.src == "./images/DSC_0898.JPG") {
      loadGPX('./data/panaOnWater.gpx');
    }

    if (item.src == "./images/DSC_0961.JPG") {
      loadGPX('./data/panaToGuate.gpx');
    }

    // Set map and marker
    map.setView([item.latitude, item.longitude], map.getZoom());

    if (window.currentMarker) {
     map.removeLayer(window.currentMarker);
    }

    window.currentMarker = L.marker([item.latitude, item.longitude]).addTo(map);
    
    // Set styling
    setMediaStyling(item)
  }

  function setMediaStyling(item) {
    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = "Photo";
      img.classList.add('media-element'); // Add styling class
      
      mediaContainer.appendChild(img);
    } else if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.classList.add('media-element');
      mediaContainer.appendChild(video);
    }
  }

  function prevPhoto() {
    currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
    showMedia(currentIndex);
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % mediaItems.length;
    showMedia(currentIndex);
  }

  showMedia(currentIndex);

  function loadGPX(file) {
    new L.GPX(file, {
      async: true,
      marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        shadowUrl: null
      }
    })
    .on('loaded', function(e) {
      map.fitBounds(e.target.getBounds()); // Auto-fit to track
    })
    .addTo(map);
  }
})