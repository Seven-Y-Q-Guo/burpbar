// setTimeout(() => {
//   console.log("timeout");

var connections = {};
chrome.runtime.onConnect.addListener(function (port) {
  var extensionListener = function (message, sender, sendResponse) {
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name == "request") {
      connections[message.tabId] = port;
      console.log("seven");
      fetch(message.data.url, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-site",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
        referrer:
          "https://www.baidu.com/link?url=uQrbCfgtner3tSXKUrF7uUKIoYbBgUFLhr1ITGlPIxSZL6ZIMTI7YA07-4KVqVVGyW2dNwK3x5nXKjXd4gfH88ii4JKgXyfeoZUXdlcLe2_&wd=&eqid=e896516909ac6bc90000000666fff716",
        referrerPolicy: "unsafe-url",
        body: null,
        method: message.data.method,
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.text())
        .then((res) => console.log(res));
      return;
    }

    // other message handling
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);

    var tabs = Object.keys(connections);
    for (var i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});
