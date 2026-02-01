import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Shield, FileText, BarChart3, Download, Activity, Landmark, Clock } from 'lucide-react';



const App = () => {
  const [file, setFile] = useState(null);
  const [industry, setIndustry] = useState('Manufacturing');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; 
    if (score >= 55) return '#f59e0b'; 
    return '#ef4444'; 
  };

  const handleRunAudit = async () => {
    if (!file) return alert("Please upload a financial document.");
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('industry', industry);

    try {
      const res = await fetch('https://fin-sentinel-pro-backend.onrender.com', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      alert("Backend connection failed. Ensure Python server is running.");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = 20;

    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("STRATEGIC FINANCIAL AUDIT REPORT", pageWidth / 2, y, { align: "center" });
    y += 10;

    
    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Sector", industry],
        ["Financial Health Score", `${data.score}%`],
        ["Estimated Cash Runway", `${data.runway} Days`],
        ["Total Revenue", `INR ${data.income}`],
        ["Total Operating Expense", `INR ${data.expense}`],
        ["Net Cash Position", `INR ${data.income - data.expense}`],
        ["NBFC Loan Eligibility", data.loan],
      ],
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59] },
    });

    
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI Auditor Executive Summary", 14, yPos);
    yPos += 8;

    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const textLines = doc.splitTextToSize(data.report_en, pageWidth - 20);
    const lineHeight = 6;

    textLines.forEach(line => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    doc.text(line, 10, yPos);
    yPos += lineHeight;
    });

    doc.save("SME_Strategic_Audit.pdf");
  };


  const chartData = data ? [
    { name: 'Revenue', value: data.income },
    { name: 'Expenses', value: data.expense },
  ] : [];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.logoGroup}>
          <Shield size={28} color="#3b82f6" />
          <h2 style={styles.logoText}>FIN-SENTINEL <span style={{fontWeight:300}}>PRO</span></h2>
        </div>
        <div style={styles.secureBadge}>🛡️ AES-256 ENCRYPTED</div>
      </nav>

      <main style={styles.main}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <FileText size={20} color="#64748b" />
            <span style={styles.cardTitle}>Data Ingestion Engine</span>
          </div>
          <div style={styles.controls}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Upload Statement</label>
              <input 
                type="file" 
                accept=".csv,.pdf,.xlsx,.xls" 
                onChange={e => setFile(e.target.files[0])} 
                style={styles.fileInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Business Sector</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={styles.select}>
                {["Manufacturing", "Retail", "Services", "Agri"].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <button onClick={handleRunAudit} style={loading ? styles.btnDisabled : styles.btnPrimary}>
              {loading ? "PROCESSING..." : "EXECUTE STRATEGIC AUDIT"}
            </button>
          </div>
        </section>

        {data && (
          <div style={styles.dashboardGrid}>
            {/* KPI Section with Dynamic Colors */}
            <div style={styles.kpiCard}>
              <Activity size={24} color={getScoreColor(data.score)} />
              <div style={styles.kpiLabel}>HEALTH SCORE</div>
              <div style={{...styles.kpiValue, color: getScoreColor(data.score)}}>{data.score}%</div>
            </div>

            <div style={styles.kpiCard}>
              <Clock size={24} color="#3b82f6" />
              <div style={styles.kpiLabel}>EST. CASH RUNWAY</div>
              <div style={styles.kpiValue}>{data.runway} <span style={{fontSize: '1rem', color: '#64748b'}}>Days</span></div>
            </div>

            <div style={{...styles.card, gridColumn: 'span 2'}}>
              <div style={styles.cardHeader}><BarChart3 size={20} /> <span style={styles.cardTitle}>Cash Flow Analytics</span></div>
              <div style={styles.chartContainer}>
                <div style={{width: '50%', height: 250}}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={styles.statsList}>
                    <div style={styles.statItem}><span>Gross Income:</span> <strong>₹{data.income.toLocaleString()}</strong></div>
                    <div style={styles.statItem}><span>Total Expenses:</span> <strong style={{color: '#ef4444'}}>₹{data.expense.toLocaleString()}</strong></div>
                    <div style={styles.statItem}><span>Recommended:</span> <strong style={{color: '#2563eb'}}>{data.loan}</strong></div>
                </div>
              </div>
            </div>

            <div style={{...styles.card, gridColumn: 'span 2'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                <div style={styles.cardHeader}><Shield size={20} /> <span style={styles.cardTitle}>Executive Audit Summary</span></div>
                <button onClick={downloadPDF} style={styles.btnDownload}>
                  <Download size={16} /> DOWNLOAD PDF REPORT
                </button>
              </div>
              <div style={styles.reportContent}>
                {data.report_en}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { background: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
  navbar: { background: '#0f172a', color: '#fff', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoText: { margin: 0, fontSize: '1.25rem', letterSpacing: '1px' },
  secureBadge: { color: '#10b981', fontSize: '0.7rem', border: '1px solid #10b981', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 },
  main: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
  card: { background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', marginBottom: '15px' },
  cardTitle: { fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  controls: { display: 'flex', gap: '20px', alignItems: 'flex-end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  label: { fontSize: '0.75rem', fontWeight: 700, color: '#64748b' },
  fileInput: { padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' },
  btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },
  btnDisabled: { background: '#94a3b8', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'not-allowed' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  kpiCard: { background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  kpiLabel: { fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginTop: '10px' },
  kpiValue: { fontSize: '3rem', fontWeight: 900, color: '#1e293b' },
  chartContainer: { display: 'flex', alignItems: 'center' },
  statsList: { flex: 1, paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '15px' },
  statItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', fontSize: '0.95rem' },
  reportContent: { background: '#f1f5f9', padding: '20px', borderRadius: '12px', lineHeight: '1.7', fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap' },
  btnDownload: { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
};

export default App;