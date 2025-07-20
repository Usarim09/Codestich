function displaySnippets() {
  chrome.storage.local.get(['snippets'], (result) => {
    const container = document.getElementById('snippetList');
    container.innerHTML = '';
    const snippets = result.snippets || {};
    Object.entries(snippets).forEach(([hash, s]) => {
      const div = document.createElement('div');
      div.className = 'snippet';
      div.dataset.hash = hash;

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${s.file} • ${new Date(s.timestamp).toLocaleTimeString()}`;

      const code = document.createElement('pre');
      code.className = 'code-preview';
      code.textContent = s.code.slice(0, 300);

      const note = document.createElement('input');
      note.className = 'note-input';
      note.placeholder = 'Add a note...';
      note.value = s.notes || '';
      note.onchange = () => {
        chrome.runtime.sendMessage({ type: 'updateNote', hash, notes: note.value });
      };

      const btnRow = document.createElement('div');
      btnRow.className = 'btn-row';

      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
      delBtn.onclick = () => {
        chrome.runtime.sendMessage({ type: 'deleteSnippet', hash }, () => displaySnippets());
      };

      const viewBtn = document.createElement('button');
      viewBtn.textContent = '🔗';
      viewBtn.onclick = () => window.open(s.rawUrl, '_blank');

      btnRow.appendChild(viewBtn);
      btnRow.appendChild(delBtn);

      div.appendChild(meta);
      div.appendChild(code);
      div.appendChild(note);
      div.appendChild(btnRow);
      container.appendChild(div);
    });

    new Sortable(container, {
      animation: 150,
      onEnd: () => {
        const order = [...container.children].map(div => div.dataset.hash);
        const reordered = {};
        order.forEach(hash => {
          if (snippets[hash]) reordered[hash] = snippets[hash];
        });
        chrome.storage.local.set({ snippets: reordered });
      }
    });
  });
}

document.getElementById('exportBtn').addEventListener('click', () => {
  chrome.storage.local.get(['snippets'], (result) => {
    const zip = new JSZip();
    const snippets = result.snippets || {};
    Object.values(snippets).forEach((s, i) => {
      const filename = s.file.split('/').pop() || `snippet_${i}.js`;
      zip.file(filename, `// From ${s.file}\n${s.code}`);
    });
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stitched_code.zip';
      a.click();
    });
  });
});

// Dark mode toggle
const themeBtn = document.getElementById('themeToggle');
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('codestitch-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};

if (localStorage.getItem('codestitch-theme') === 'dark') {
  document.body.classList.add('dark');
}

displaySnippets();

