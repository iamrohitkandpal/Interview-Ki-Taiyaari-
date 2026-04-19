/**
 * Report Service - Export functionality for Bhisma
 * Provides JSON export and PDF generation via browser print
 */

function toSafeString(value, fallback = '') {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function toSafeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function slugify(value, fallback = 'report') {
  const text = toSafeString(value, fallback).toLowerCase();
  return text.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || fallback;
}

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function triggerJsonDownload(data, filename) {
  if (!isBrowserEnvironment() || typeof Blob === 'undefined' || !URL?.createObjectURL) {
    throw new Error('File export is not supported in this environment');
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Export test result as JSON file
 * @param {Object} result - Test result object
 * @param {string} filename - Optional custom filename
 */
export const exportAsJSON = (result, filename) => {
  if (!result || typeof result !== 'object') {
    throw new Error('A valid test result object is required');
  }

  const safeResults = toSafeArray(result.results);
  const modelName = toSafeString(result.modelName, 'Unknown Model');

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Bhisma',
    testResult: {
      id: toSafeString(result.id, ''),
      modelName,
      provider: toSafeString(result.provider, ''),
      timestamp: toSafeString(result.createdAt, new Date().toISOString()),
      summary: {
        totalAttacks: toSafeNumber(result.totalAttacks, safeResults.length),
        passed: toSafeNumber(result.passed, 0),
        failed: toSafeNumber(result.failed, 0),
        riskScore: toSafeNumber(result.riskScore, 0),
        riskLevel: toSafeString(result.riskLevel, 'MINIMAL')
      },
      results: safeResults.map((item) => ({
        attackName: toSafeString(item?.attackName, ''),
        category: toSafeString(item?.category, ''),
        severity: toSafeString(item?.severity, ''),
        vulnerable: item?.vulnerable === true,
        confidence: toSafeNumber(item?.confidence, 0),
        reason: toSafeString(item?.reason, ''),
        prompt: toSafeString(item?.prompt, ''),
        response: toSafeString(item?.response, ''),
        error: toSafeString(item?.error, '')
      }))
    }
  };

  const computedFilename = toSafeString(filename, `bhisma-report-${slugify(modelName)}-${Date.now()}.json`);
  triggerJsonDownload(exportData, computedFilename);
  return computedFilename;
};

/**
 * Export multiple test results as JSON
 * @param {Array} results - Array of test results
 */
export const exportAllAsJSON = (results) => {
  const safeResults = toSafeArray(results);

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Bhisma',
    totalTests: safeResults.length,
    testResults: safeResults.map((item) => ({
      id: toSafeString(item?.id, ''),
      modelName: toSafeString(item?.modelName, 'Unknown Model'),
      riskScore: toSafeNumber(item?.riskScore, 0),
      riskLevel: toSafeString(item?.riskLevel, 'MINIMAL'),
      totalAttacks: toSafeNumber(item?.totalAttacks, 0),
      passed: toSafeNumber(item?.passed, 0),
      failed: toSafeNumber(item?.failed, 0),
      timestamp: toSafeString(item?.createdAt, new Date().toISOString())
    }))
  };

  const filename = `bhisma-all-results-${Date.now()}.json`;
  triggerJsonDownload(exportData, filename);
  return filename;
};

/**
 * Generate and open PDF report using browser print
 * @param {Object} result - Test result object
 */
export const exportAsPDF = (result) => {
  if (!result || typeof result !== 'object') {
    throw new Error('A valid test result object is required');
  }

  if (!isBrowserEnvironment() || typeof window.open !== 'function') {
    throw new Error('PDF export is not supported in this environment');
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow || !printWindow.document) {
    throw new Error('Unable to open print window. Please allow pop-ups and try again.');
  }

  const safeResults = toSafeArray(result.results);
  const vulnerableResults = safeResults.filter((item) => item?.vulnerable === true);
  const modelName = toSafeString(result.modelName, 'Unknown Model');
  const riskLevel = toSafeString(result.riskLevel, 'MINIMAL').toUpperCase();
  const riskScore = Math.max(0, Math.min(100, toSafeNumber(result.riskScore, 0)));
  const totalAttacks = toSafeNumber(result.totalAttacks, safeResults.length);
  const passed = toSafeNumber(result.passed, safeResults.filter((item) => item?.vulnerable !== true).length);
  const failed = toSafeNumber(result.failed, vulnerableResults.length);
  const reportId = toSafeString(result.id, 'N/A');
  const riskClass = `risk-${riskLevel.toLowerCase()}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bhisma Security Report - ${escapeHtml(modelName)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 40px; 
          color: #1e293b;
          line-height: 1.6;
        }
        .header { 
          border-bottom: 3px solid #6366f1; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .header h1 { 
          font-size: 28px; 
          color: #0f172a;
          margin-bottom: 5px;
        }
        .header .subtitle { 
          color: #64748b; 
          font-size: 14px; 
        }
        .summary { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 15px; 
          margin-bottom: 30px; 
        }
        .stat { 
          background: #f1f5f9; 
          padding: 15px; 
          border-radius: 8px; 
          text-align: center; 
        }
        .stat-value { 
          font-size: 32px; 
          font-weight: bold; 
          color: #0f172a; 
        }
        .stat-label { 
          font-size: 12px; 
          color: #64748b; 
          text-transform: uppercase; 
        }
        .risk-critical { color: #dc2626; }
        .risk-high { color: #ea580c; }
        .risk-medium { color: #ca8a04; }
        .risk-low { color: #16a34a; }
        .section { margin-bottom: 30px; }
        .section h2 { 
          font-size: 18px; 
          color: #0f172a; 
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 13px; 
        }
        th { 
          background: #f8fafc; 
          text-align: left; 
          padding: 12px; 
          font-weight: 600;
          color: #475569;
        }
        td { 
          padding: 12px; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .status-vulnerable { 
          background: #fef2f2; 
          color: #dc2626; 
          padding: 4px 10px; 
          border-radius: 4px; 
          font-weight: 500;
        }
        .status-safe { 
          background: #f0fdf4; 
          color: #16a34a; 
          padding: 4px 10px; 
          border-radius: 4px; 
          font-weight: 500;
        }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e2e8f0; 
          text-align: center; 
          color: #94a3b8; 
          font-size: 12px; 
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛡️ Bhisma Security Report</h1>
        <p class="subtitle">Model: ${escapeHtml(modelName)} | Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div class="summary">
        <div class="stat">
          <div class="stat-value ${riskClass}">${riskScore}%</div>
          <div class="stat-label">Risk Score</div>
        </div>
        <div class="stat">
          <div class="stat-value">${totalAttacks}</div>
          <div class="stat-label">Total Attacks</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #16a34a;">${passed}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #dc2626;">${failed}</div>
          <div class="stat-label">Vulnerable</div>
        </div>
      </div>

      ${vulnerableResults.length > 0 ? `
        <div class="section">
          <h2>⚠️ Vulnerabilities Found (${vulnerableResults.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Attack</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              ${vulnerableResults.map(r => `
                <tr>
                  <td><strong>${escapeHtml(toSafeString(r.attackName, '-'))}</strong></td>
                  <td>${escapeHtml(toSafeString(r.category, '-'))}</td>
                  <td>${escapeHtml(toSafeString(r.severity, '-'))}</td>
                  <td>${toSafeNumber(r.confidence, 0)}%</td>
                  <td>${escapeHtml(toSafeString(r.reason, '-'))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="section">
        <h2>✅ All Test Results</h2>
        <table>
          <thead>
            <tr>
              <th>Attack Name</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${safeResults.map(r => `
              <tr>
                <td>${escapeHtml(toSafeString(r.attackName, '-'))}</td>
                <td>${escapeHtml(toSafeString(r.category, '-'))}</td>
                <td>${escapeHtml(toSafeString(r.severity, '-'))}</td>
                <td><span class="${r.vulnerable ? 'status-vulnerable' : 'status-safe'}">${r.vulnerable ? 'VULNERABLE' : 'SAFE'}</span></td>
                <td>${toSafeNumber(r.confidence, 0)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Generated by Bhisma - LLM Security Testing Platform</p>
        <p>Report ID: ${escapeHtml(reportId)}</p>
      </div>

      <script>
        window.onload = () => window.print();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  return true;
};

/**
 * Copy result summary to clipboard
 * @param {Object} result - Test result object
 */
export const copyToClipboard = async (result) => {
  if (!result || typeof result !== 'object') {
    throw new Error('A valid test result object is required');
  }

  const safeResults = toSafeArray(result.results);
  const vulnerableRows = safeResults.filter((item) => item?.vulnerable === true);
  const modelName = toSafeString(result.modelName, 'Unknown Model');
  const riskScore = toSafeNumber(result.riskScore, 0);
  const riskLevel = toSafeString(result.riskLevel, 'MINIMAL');
  const passed = toSafeNumber(result.passed, 0);
  const failed = toSafeNumber(result.failed, 0);
  const totalAttacks = toSafeNumber(result.totalAttacks, safeResults.length);

  const summary = `
Bhisma Security Report
============================
Model: ${modelName}
Risk Score: ${riskScore}% (${riskLevel})
Total Attacks: ${totalAttacks}
Passed: ${passed}
Vulnerable: ${failed}

Vulnerabilities:
${vulnerableRows.map((item) => `• ${toSafeString(item.attackName, 'Unknown Attack')} (${toSafeString(item.category, 'uncategorized')}) - ${toSafeNumber(item.confidence, 0)}% confidence`).join('\n') || 'None found'}

Generated: ${new Date().toLocaleString()}
  `.trim();

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary);
    return true;
  }

  if (!isBrowserEnvironment()) {
    throw new Error('Clipboard is not supported in this environment');
  }

  const textArea = document.createElement('textarea');
  textArea.value = summary;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const copied = document.execCommand('copy');
    if (!copied) {
      throw new Error('Failed to copy report to clipboard');
    }
  } finally {
    document.body.removeChild(textArea);
  }

  return true;
};

function escapeHtml(value) {
  const text = String(value ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
