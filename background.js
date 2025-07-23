// background.js  (MV3 service worker)

importScripts(chrome.runtime.getURL("vendor/transformers.min.js"));

// use globalThis instead of window
const { pipeline } = globalThis.transformers;

let classifierPromise = (async () => {
  return await pipeline(
    "text-classification",
    "Xenova/bert-base-uncased-hatexplain",
    { quantized: true }
  );
})();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "classify") return;

  classifierPromise.then(async classify => {
    const [{ label, score }] = await classify(msg.text, { topk: 1 });
    sendResponse({ label, score });
  });
  return true; // keep port open
});
