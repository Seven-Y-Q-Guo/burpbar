// var backgroundPageConnection = chrome.runtime.connect({
//   name: "burpbar",
// });
// console.log(backgroundPageConnection);
document.querySelector("button").addEventListener("click", () => {
  var backgroundPageConnection = chrome.runtime.connect({
    name: "burpbar",
  });
  console.log(backgroundPageConnection);

  backgroundPageConnection.postMessage({
    name: "request",
    data: {
      url: document.querySelector("input").value,
    },
  });
});
