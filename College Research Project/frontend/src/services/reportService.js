/**
 * Report Service - Export functionality for PromptShield
 * Provides JSON export and PDF generation via browser print
 */

/**
 * Export test result as JSON file
 * @param {Object} result - Test result object
 * @param {string} filename - Optional custom filename
 */
export const exportAsJSON = (result, filename) => {
    const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        platform: 'PromptShield',
        testResult: {
            id: result.id,
            modelName: result.modelName,
            provider: result.provider,
            timestamp: result.createdAt,
            summary: {
                totalAttacks: result.totalAttacks,
                passed: result.passed,
                failed: result.failed,
                riskScore: result.riskScore,
                riskLevel: result.riskLevel
            },
            results: result.results?.map(r => ({
                attackName: r.attackName,
                category: r.category,
                severity: r.severity,
                vulnerable: r.vulnerable,
                confidence: r.confidence,
                reason: r.reason,
                prompt: r.prompt,
                response: r.response
            }))
        }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `promptshield-report-${result.modelName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Export multiple test results as JSON
 * @param {Array} results - Array of test results
 */
export const exportAllAsJSON = (results) => {
    const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        platform: 'PromptShield',
        totalTests: results.length,
        testResults: results.map(r => ({
            id: r.id,
            modelName: r.modelName,
            riskScore: r.riskScore,
            riskLevel: r.riskLevel,
            totalAttacks: r.totalAttacks,
            passed: r.passed,
            failed: r.failed,
            timestamp: r.createdAt
        }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptshield-all-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Generate and open PDF report using browser print
 * @param {Object} result - Test result object
 */
export const exportAsPDF = (result) => {
    const printWindow = window.open('', '_blank');

    const vulnerableResults = result.results?.filter(r => r.vulnerable) || [];
    const safeResults = result.results?.filter(r => !r.vulnerable) || [];

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>PromptShield Security Report - ${result.modelName}</title>
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
        <h1>🛡️ PromptShield Security Report</h1>
        <p class="subtitle">Model: ${result.modelName} | Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div class="summary">
        <div class="stat">
          <div class="stat-value risk-${result.riskLevel.toLowerCase()}">${result.riskScore}%</div>
          <div class="stat-label">Risk Score</div>
        </div>
        <div class="stat">
          <div class="stat-value">${result.totalAttacks}</div>
          <div class="stat-label">Total Attacks</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #16a34a;">${result.passed}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #dc2626;">${result.failed}</div>
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
                  <td><strong>${r.attackName}</strong></td>
                  <td>${r.category}</td>
                  <td>${r.severity}</td>
                  <td>${r.confidence}%</td>
                  <td>${r.reason || '-'}</td>
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
            ${result.results?.map(r => `
              <tr>
                <td>${r.attackName}</td>
                <td>${r.category}</td>
                <td>${r.severity}</td>
                <td><span class="${r.vulnerable ? 'status-vulnerable' : 'status-safe'}">${r.vulnerable ? 'VULNERABLE' : 'SAFE'}</span></td>
                <td>${r.confidence}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Generated by PromptShield - LLM Security Testing Platform</p>
        <p>Report ID: ${result.id}</p>
      </div>

      <script>
        window.onload = () => window.print();
      </script>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
};

/**
 * Copy result summary to clipboard
 * @param {Object} result - Test result object
 */
export const copyToClipboard = async (result) => {
    const summary = `
PromptShield Security Report
============================
Model: ${result.modelName}
Risk Score: ${result.riskScore}% (${result.riskLevel})
Total Attacks: ${result.totalAttacks}
Passed: ${result.passed}
Vulnerable: ${result.failed}

Vulnerabilities:
${result.results?.filter(r => r.vulnerable).map(r => `• ${r.attackName} (${r.category}) - ${r.confidence}% confidence`).join('\n') || 'None found'}

Generated: ${new Date().toLocaleString()}
  `.trim();

    await navigator.clipboard.writeText(summary);
    return true;
};
