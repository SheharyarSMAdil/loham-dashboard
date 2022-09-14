const electron = require("electron");
const { ipcRenderer } = electron;

ipcRenderer.on("pid:added", fetchID);
ipcRenderer.on("pid:deleted", fetchID);

// set true as default if not previously
let autoFetchFlag = localStorage.getItem("autoFetch") || "true";
let autoScrollFlag = localStorage.getItem("autoScroll") || "true";

// Convert string to bool
autoFetchFlag = autoFetchFlag === "true";
autoScrollFlag = autoScrollFlag === "true";

//set this value to toggle input to sync the state
document.getElementById("autoFetch").checked = autoFetchFlag;
document.getElementById("autoScroll").checked = autoScrollFlag;

var allParaStructure = [];
var steps = 80;
var previousScrollY = -1;

// fetch data from server of all the ids which are added in this dashboard
const fetchServerData = () => {
  allParaStructure = [];
  let thresholdData = JSON.parse(localStorage.getItem("threshold")) || {};
  const storedData = JSON.parse(localStorage.getItem("info")) || [];
  document.getElementById("deviceWrapper").innerHTML = "";

  storedData.forEach((info) => {
    let cardContent = "";
    // const serverData = async () => {
    fetch("https://api.enggenv.com/api/fetchdata?id=" + info.pid)
      .then((response) => response.json())
      .then((data) => {
        delete data.lg;
        delete data.lt;
        delete data.bv;
        delete data.ts_client;

        const lastUpdate = data.ts_server;
        delete data.ts_server;

        // console.log(data);
        let deviceWrapper = document.createElement("div");
        deviceWrapper.setAttribute("class", "deviceWrapper");
        deviceWrapper.setAttribute("id", "deviceWrapper");
        let paraList = [];
        Object.entries(data).forEach((item) => {
          paraList.push(item[0]);
          // console.table({
          //   pid: info.pid,
          //   threshold: +thresholdData[info.pid][item[0]],
          //   curr: +item[1],
          // });
          let status = thresholdData[info.pid]
            ? +thresholdData[info.pid][item[0]] < +item[1]
              ? "invalid"
              : "valid"
            : "";

          cardContent += `<div class="card" data-threshold=${status}>
                      <div class="cardHeader">
                      `;
          if (item[0] == "hf") cardContent += `<p>Fluorine</p>`;
          else cardContent += `<p>${item[0].split("_").join(".")}</p>`;
          cardContent += `</div>
                      <div class="cardBody">
                          <p>${item[1]}</p>
                      </div>
                  </div>`;
        });

        allParaStructure.push({ id: info.pid, para: [...paraList] });
        document.getElementById(
          "deviceWrapper"
        ).innerHTML += `<label><strong>${info.pid}</strong> (${info.alias})<span class="lastUpdate">(Last Update: ${lastUpdate})</span></label><div class="cardWrapper">  ${cardContent}</div>`;
      })
      .catch((err) => console.error(err));
  });
};

const closeWindowHandler = () => {
  document.getElementById("thresholdCard").style.transform =
    "scale(0) translate(0%,500%)";
};

const validateThresholdHandler = () => {
  let id = document.getElementById("deviceIds").value;
  let para = document.getElementById("devicePara").value;
  let threshold = document.getElementById("thresholdValue").value;
  let thresholdData = JSON.parse(localStorage.getItem("threshold")) || {};
  //   thresholdData = [];
  if (threshold == "") threshold = "10000";
  if (thresholdData[id]) {
    thresholdData[id] = { ...thresholdData[id], [para]: threshold };
  } else {
    thresholdData = { ...thresholdData, [id]: { [para]: threshold } };
  }
  localStorage.setItem("threshold", JSON.stringify(thresholdData));
};

const showThresholdCard = () => {
  document.getElementById("thresholdCard").style.display = "flex";
  document.getElementById("thresholdCard").style.transform =
    "scale(1) translate(-50%,-50%)";
  deviceList = JSON.parse(localStorage.getItem("info")).map(
    (device) => `${device.pid} (${device.alias})`
  );
  console.log(deviceList);
  document.getElementById("deviceIds").innerHTML = "";
  deviceList.forEach((item) => {
    document.getElementById(
      "deviceIds"
    ).innerHTML += `<option value=${item}>${item}</option>`;
  });
  setParaHandler({ value: deviceList[0] });
};

const setParaHandler = (e) => {
  document.getElementById("devicePara").innerHTML = "";
  console.log(e.value);
  console.log(allParaStructure);
  let optionPara = allParaStructure.find(
    (device) => device.id === e.value
  ).para;
  optionPara.forEach((item) => {
    document.getElementById(
      "devicePara"
    ).innerHTML += `<option value=${item}>${item}</option>`;
  });
};

function fetchID(e, status) {
  console.log(status);
  localStorage.setItem("status", status);
  const info = document.getElementById("info");
  info.innerHTML = localStorage.getItem("info");
}

//auto call itself after given minutes
(getInfo = () => {
  if (
    window.navigator.onLine &&
    JSON.parse(localStorage.getItem("info") && autoFetchFlag)
  ) {
    document.getElementById("deviceWrapper").innerHTML = "";
    fetchServerData();
  } else {
    if (window.navigator.onLine) {
    }
    console.log(JSON.parse(localStorage.getItem("info")));
    if (!JSON.parse(localStorage.getItem("info"))) {
      document.getElementById("deviceWrapper").innerHTML =
        "<h3 style='position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)'>No Device Found, Please add your device from above options menu";
    }
  }

  setTimeout(() => {
    getInfo();
  }, 20000);
})();

//auto call itself after given minutes
(autoScroll = () => {
  setTimeout(() => {
    if (autoScrollFlag) {
      if (previousScrollY !== window.scrollY) {
        previousScrollY = window.scrollY;
        scroll(0, window.scrollY + steps);
      } else {
        steps *= -1;
        previousScrollY = -1;
      }
    }
    autoScroll();
  }, 2000);
})();

const toggleAutoScroll = (e) => {
  autoScrollFlag = e.checked;
  localStorage.setItem("autoScroll", e.checked.toString());
};
const toggleAutoFetch = (e) => {
  autoFetchFlag = e.checked;
  localStorage.setItem("autoFetch", e.checked.toString());
  getInfo();
};

// sets click event listeners for fetchServerData & showThresholdCard
document
  .getElementById("downloadData")
  .addEventListener("click", fetchServerData);
document
  .getElementById("setThreshold")
  .addEventListener("click", showThresholdCard);

// autoScroll();

// const electron = require("electron");
// const { ipcRenderer } = electron;

// ipcRenderer.on("pid:added", fetchID);
// ipcRenderer.on("pid:deleted", fetchID);

// const fetchServerData = () => {
//   allParaStructure = [];
//   let thresholdData = JSON.parse(localStorage.getItem("threshold")) || {};
//   const storedData = JSON.parse(localStorage.getItem("info")) || [];
//   document.getElementById("deviceWrapper").innerHTML = "";
//   // console.log(storedData);
//   // console.log(storedData.length)

//   // var dvTable = document.getElementById("dvTable");
//   // dvTable.innerHTML = "";

//   storedData.forEach((info) => {
//     // console.log(info.pid);

//     let cardContent = "";
//     // const serverData = async () => {
//     fetch("https://api.enggenv.com/api/fetchdata?id=" + info.pid)
//       .then((response) => response.json())
//       .then((data) => {
//         delete data.lg;
//         delete data.lt;
//         delete data.bv;
//         delete data.ts_client;

//         const lastUpdate = data.ts_server;
//         delete data.ts_server;

//         console.log(data);

//         let deviceWrapper = document.createElement("div");
//         deviceWrapper.setAttribute("class", "deviceWrapper");
//         deviceWrapper.setAttribute("id", "deviceWrapper");
//         let paraList = [];
//         Object.entries(data).forEach((item) => {
//           paraList.push(item[0]);

//           let status = thresholdData[info.pid]
//             ? thresholdData[info.pid][item[0]] < item[1]
//               ? "invalid"
//               : "valid"
//             : "";
//           cardContent += `<div class="card" data-threshold=${status}>
//                               <div class="cardHeader">
//                                   <p>${item[0].split("_").join(".")}</p>
//                               </div>
//                               <div class="cardBody">
//                                   <p>${item[1]}</p>
//                               </div>
//                           </div>
//                           `;
//         });

//         allParaStructure.push({ id: info.pid, para: [...paraList] });
//         document.getElementById(
//           "deviceWrapper"
//         ).innerHTML += `<label><strong>${info.pid}</strong> (${info.alias})<span class="lastUpdate">(Last Update: ${lastUpdate})</span></label><div class="cardWrapper">  ${cardContent}</div>`;
//       })
//       .catch((err) => console.error(err));
//     // }

//     // var dvTable = document.getElementById("dvTable");
//     // dvTable.innerHTML += "";
//     // dvTable.appendChild(table);
//   });
// };

// const closeWindowHandler = () => {
//   document.getElementById("thresholdCard").style.display = "none";
// };

// const validateThresholdHandler = () => {
//   let id = document.getElementById("deviceIds").value;
//   let para = document.getElementById("devicePara").value;
//   let threshold = document.getElementById("thresholdValue").value;
//   let thresholdData = JSON.parse(localStorage.getItem("threshold")) || {};
//   //   thresholdData = [];
//   if (thresholdData[id]) {
//     thresholdData[id] = { ...thresholdData[id], [para]: threshold };
//   } else {
//     thresholdData = { ...thresholdData, [id]: { [para]: threshold } };
//   }
//   localStorage.setItem("threshold", JSON.stringify(thresholdData));
// };

// const showThresholdCard = () => {
//   document.getElementById("thresholdCard").style.display = "flex";
//   deviceList = JSON.parse(localStorage.getItem("info")).map(
//     (device) => device.pid
//   );
//   console.log(deviceList);
//   document.getElementById("deviceIds").innerHTML = "";
//   deviceList.forEach((item) => {
//     document.getElementById(
//       "deviceIds"
//     ).innerHTML += `<option value=${item}>${item}</option>`;
//   });
//   setParaHandler({ value: deviceList[0] });
// };

// const setParaHandler = (e) => {
//   document.getElementById("devicePara").innerHTML = "";
//   console.log(e.value);
//   console.log(allParaStructure);
//   let optionPara = allParaStructure.find(
//     (device) => device.id === e.value
//   ).para;
//   optionPara.forEach((item) => {
//     document.getElementById(
//       "devicePara"
//     ).innerHTML += `<option value=${item}>${item}</option>`;
//   });
// };

// document
//   .getElementById("downloadData")
//   .addEventListener("click", fetchServerData);
// document
//   .getElementById("setThreshold")
//   .addEventListener("click", showThresholdCard);

// function fetchID(e, status) {
//   console.log(status);
//   localStorage.setItem("status", status);
//   const info = document.getElementById("info");
//   info.innerHTML = localStorage.getItem("info");
// }

// getInfo = () => {
//   document.getElementById("deviceWrapper").innerHTML = "";
//   if (window.navigator.onLine && JSON.parse(localStorage.getItem("info"))) {
//     fetchServerData();
//   } else {
//     if (window.navigator.onLine) {
//     }
//   }

//   setTimeout(() => {
//     getInfo();
//   }, 20000);
// };

// getInfo();

// var allParaStructure = [];
