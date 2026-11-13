const endpoint = document.getElementById('endpoint').textContent;
const config = { name: 'gajaa-panchang', type: 'http', url: endpoint };
const editorLink = 'vscode:mcp/install?' + encodeURIComponent(JSON.stringify(config));
document.getElementById('vscode').href = 'https://vscode.dev/redirect?url=' + encodeURIComponent(editorLink);
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      status.textContent = 'Copied.';
    } catch {
      status.textContent = 'Clipboard unavailable. Select and copy the text manually.';
    }
  });
});
