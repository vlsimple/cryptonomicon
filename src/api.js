const API_KEY =
  "d09b6b660e9abef23bec9001e68435f3957eb2499eb12776f3062b44b12b29e2";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type != AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsibscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

export const loadCoinList = () =>
  fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true`)
    .then((r) => r.json())
    .then((rawData) =>
      Object.fromEntries(
        Object.entries(rawData.Data).map(([key, value]) => [
          key,
          value.FullName,
        ])
      )
    );

//window.tickers = tickersHandlers;
