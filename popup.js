let changeColor = document.getElementById("changeColor");

changeColor.onclick = function (el) {
  chrome.storage.sync.get("color", function (data) {
    changeColor.style.backgroundColor = data.color;
  });
};