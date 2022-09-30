const tickers = new Map();

export const loadTickers = (tickers) =>
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(
      ","
    )}&tsyms=USD`
  )
    .then((r) => r.json())
    .then((rawData) =>
      Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )
    );

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];
  tickers.set(ticker, [...subscribers, cb]);
};

export const unsibscribeFromTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];
  tickers.set(
    ticker,
    subscribers.filter((fn) => fn != cb)
  );
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
