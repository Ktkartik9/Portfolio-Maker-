import { getPortfolioData, savePortfolioData } from './storage.js';
import { showToast } from './utils.js';
import { updateLivePreview } from './preview.js';
import { renderActiveSectionForm } from './builder.js';

export function exportPortfolioJSON() {
  try {
    const data = getPortfolioData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Exported portfolio JSON file!', 'success');
  } catch (err) {
    console.error('Failed to export JSON:', err);
    showToast('Could not export portfolio data.', 'error');
  }
}

export function importPortfolioJSON(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid JSON format');
      }

      savePortfolioData(parsed, true);
      renderActiveSectionForm();
      updateLivePreview();
      showToast('✓ Portfolio data imported successfully!', 'success');
    } catch (err) {
      console.error('JSON Import error:', err);
      showToast('⚠️ Failed to import file: Invalid JSON structure.', 'error');
    }
  };
  reader.onerror = () => {
    showToast('Error reading imported file.', 'error');
  };
  reader.readAsText(file);
}

export function printPortfolio() {

  const data = getPortfolioData();
  savePortfolioData(data);

  window.print();
}

export function initExportHandlers() {
  const exportBtn = document.getElementById('export-json-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportPortfolioJSON);
  }

  const importInput = document.getElementById('import-json-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        importPortfolioJSON(file);

        importInput.value = '';
      }
    });
  }

  const printBtn = document.getElementById('print-pdf-btn');
  if (printBtn) {
    printBtn.addEventListener('click', printPortfolio);
  }
}
