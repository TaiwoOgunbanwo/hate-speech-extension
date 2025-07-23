// 
const hate_speech = [
    "hate", "stupid", "idiot", "dumb",
    "useless", "annoying", "dumbass"
  ];
  
  // compile once
  const WORD_REGEX = new RegExp(`\\b(${hate_speech.join("|")})\\b`, "gi");
  
  // --- MAIN ---------------------------------------------------
  console.log("[Hate-Speech] content script loaded");
  
  walkAndHighlight(document.body);           // initial pass
  observeMutations(document.body);           // handle dynamic pages
  
  // -------- functions ----------------------------------------
  function walkAndHighlight(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );
  
    let node, nodesChanged = 0;
    while ((node = walker.nextNode())) {
      nodesChanged += highlightNode(node);
    }
    if (nodesChanged)
      console.log(`[Hate-Speech] highlighted ${nodesChanged} node(s)`);
  }
  
  function highlightNode(textNode) {
    if (!textNode.nodeValue || !textNode.parentNode) return 0;
  
    const originalText = textNode.nodeValue;
    if (!WORD_REGEX.test(originalText)) return 0;     // fast exit
  
    const html = originalText.replace(
      WORD_REGEX,
      match => `<mark class="hs-flag">${match}</mark>`
    );
  
    const span = document.createElement("span");
    span.innerHTML = html;
    textNode.parentNode.replaceChild(span, textNode);
    return 1;
  }
  
  function observeMutations(target) {
    const obs = new MutationObserver(muts => {
      // disconnect → avoid infinite loop
      obs.disconnect();
      walkAndHighlight(target);
      obs.observe(target, { childList: true, subtree: true });
    });
  
    obs.observe(target, { childList: true, subtree: true });
  }
  