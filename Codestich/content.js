function injectStitchButton() {
  const codeBlocks = document.querySelectorAll('table.highlight');
  codeBlocks.forEach((block) => {
    if (!block.querySelector('.stitch-btn')) {
      const btn = document.createElement('button');
      btn.textContent = '➕ Stitch';
      btn.className = 'stitch-btn';
      btn.style.cssText = 'position:absolute; top:4px; right:4px; z-index:1000; background:#2ea44f; color:white; border:none; padding:4px; border-radius:4px; cursor:pointer;';
      btn.onclick = () => {
        const code = [...block.querySelectorAll('td.blob-code')].map(td => td.innerText).join('\n');
        const file = window.location.pathname;
        const repo = location.pathname.split('/').slice(1, 3).join('/');
        const rawUrl = window.location.href.replace('/blob/', '/raw/');
        const snippet = {
          code,
          file,
          repo,
          rawUrl,
          timestamp: new Date().toISOString(),
          notes: '',
          tags: []
        };
        chrome.runtime.sendMessage({ type: 'saveSnippet', snippet }, (res) => {
          if (res.success) alert('Code snippet stitched!');
        });
      };
      block.style.position = 'relative';
      block.appendChild(btn);
    }
  });
}

injectStitchButton();
