import * as XLSX from 'xlsx';

export interface CallAnalyticsData {
  id: string;
  tenant_id: string;
  workflow_name: string;
  session_id: string;
  user_ip: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  steps_total: number;
  steps_completed: number;
  completed_steps: any[];
  call_status: string;
  created_at: string;
}

export function exportCallAnalyticsToExcel(data: CallAnalyticsData[], filename: string = 'call_analytics') {
  // Transform data for Excel
  const excelData = data.map(record => ({
    'Session ID': record.session_id,
    'IP-Adresse': record.user_ip || 'Unbekannt',
    'Workflow': record.workflow_name,
    'Status': record.call_status === 'completed' ? 'Abgeschlossen' : 
              record.call_status === 'abandoned' ? 'Abgebrochen' : 'In Bearbeitung',
    'Gestartet': new Date(record.started_at).toLocaleString('de-DE'),
    'Beendet': record.ended_at ? new Date(record.ended_at).toLocaleString('de-DE') : '-',
    'Dauer (Sek.)': record.duration_seconds || 0,
    'Dauer (Min.)': record.duration_seconds ? Math.round(record.duration_seconds / 60 * 10) / 10 : 0,
    'Schritte gesamt': record.steps_total,
    'Schritte abgeschlossen': record.steps_completed,
    'Vollständigkeit (%)': record.steps_total > 0 
      ? Math.round((record.steps_completed / record.steps_total) * 100) 
      : 0,
    'Datum': new Date(record.created_at).toLocaleDateString('de-DE')
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Session ID
    { wch: 15 }, // IP-Adresse
    { wch: 25 }, // Workflow
    { wch: 15 }, // Status
    { wch: 20 }, // Gestartet
    { wch: 20 }, // Beendet
    { wch: 12 }, // Dauer (Sek.)
    { wch: 12 }, // Dauer (Min.)
    { wch: 15 }, // Schritte gesamt
    { wch: 20 }, // Schritte abgeschlossen
    { wch: 18 }, // Vollständigkeit
    { wch: 12 }, // Datum
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Anruf-Statistiken');

  // Create detailed steps sheet if there are completed steps
  const detailedStepsData: any[] = [];
  data.forEach(record => {
    if (record.completed_steps && Array.isArray(record.completed_steps)) {
      record.completed_steps.forEach((step: any, index: number) => {
        detailedStepsData.push({
          'Session ID': record.session_id,
          'IP-Adresse': record.user_ip || 'Unbekannt',
          'Schritt Nr.': index + 1,
          'Schritt-Titel': step.title || 'Unbekannt',
          'Kategorie': step.category || '-',
          'Abgeschlossen um': new Date(step.completedAt).toLocaleString('de-DE'),
          'Datum': new Date(record.created_at).toLocaleDateString('de-DE')
        });
      });
    }
  });

  if (detailedStepsData.length > 0) {
    const wsDetails = XLSX.utils.json_to_sheet(detailedStepsData);
    wsDetails['!cols'] = [
      { wch: 25 }, // Session ID
      { wch: 15 }, // IP-Adresse
      { wch: 12 }, // Schritt Nr.
      { wch: 30 }, // Schritt-Titel
      { wch: 20 }, // Kategorie
      { wch: 20 }, // Abgeschlossen um
      { wch: 12 }, // Datum
    ];
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Schritt-Details');
  }

  // Generate Excel file and trigger download
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}
