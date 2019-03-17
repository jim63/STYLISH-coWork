app.getBranch = function() {
  fetch(`https://hhhhhanyi.com/api/1.0/store`)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      let allStores = myJson.data;
      allStores.forEach(element => {
        let storeName = element.name;
        let storeAddress = element.address;
        let storePhone = element.phone;
        let storeTime = element.time;
        let storePoint = element.point.split(",");
        console.log(storeName, storeAddress, storePhone, storeTime, storePoint);
        let branchInfoEach = document.createElement("div");
        branchInfoEach.className = "branchInfoEach";
        branchInfoEach.innerHTML += `<div class="branchInfoEachMap"></div><div class="branchInfoRachWord"><div class="storeName"><span>${storeName}</span></div><p>門市地址：<span class="storeAddress"></span>${storeAddress}</p><p>門市電話：<span class="storePhone">${storePhone}</span></p><p>營業時間：<span class="storeBusinessHour">${storeTime}</span></p></div></div>`;
        app.initMap(storePoint[0], storePoint[1], branchInfoEach);
        let branchInfo = document.querySelector(".branchInfo");
        branchInfo.appendChild(branchInfoEach);
      });
    });
};

app.initMap = function(lat, lng, parentNode) {
  var uluru = { lat: Number(lat), lng: Number(lng) };

  parentNode.querySelectorAll(".branchInfoEachMap").forEach(element => {
    pasteMap(element);
  });

  function pasteMap(items) {
    var map = new google.maps.Map(items, {
      zoom: 15,
      center: uluru
    });
    var marker = new google.maps.Marker({
      position: uluru,
      map: map
    });
  }
};
