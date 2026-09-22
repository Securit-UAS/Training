
let DATA = null;

async function loadData(){
  const res = await fetch('./data.json', {cache:'no-store'});
  DATA = await res.json();
  render();
}

function labelForStatus(status){
  return ({
    current:'Current',
    due:'Reassessment Due',
    expired:'Expired',
    failed:'Failed',
    'not-taken':'Not Taken'
  })[status] || status;
}

function render(){
  const generated = new Date(DATA.generatedAt);
  document.getElementById('generatedTime').textContent =
    'Last updated: ' + generated.toLocaleString('en-GB', {dateStyle:'medium', timeStyle:'short'});

  const totals = DATA.courses.reduce((a,c)=>{
    a.due += c.due; a.expired += c.expired; a.failed += c.failed; a.notTaken += c.notTaken;
    return a;
  }, {due:0,expired:0,failed:0,notTaken:0});

  const fullyCompliant = Math.max(
    0,
    DATA.activeStaff - Math.max(...DATA.courses.map(c => c.due + c.expired + c.failed + c.notTaken))
  );

  const kpis = [
    ['Active Staff',DATA.activeStaff,'blue'],
    ['Fully Compliant',fullyCompliant,'green'],
    ['Reassessment Due',totals.due,'amber'],
    ['Expired',totals.expired,'red'],
    ['Failed',totals.failed,'red'],
    ['Not Taken',totals.notTaken,'grey']
  ];

  document.getElementById('kpiGrid').innerHTML = kpis.map(k => `
    <div class="kpi-card ${k[2]}">
      <div class="kpi-label">${k[0]}</div>
      <div class="kpi-value">${k[1]}</div>
    </div>`).join('');

  document.getElementById('courseTableBody').innerHTML = DATA.courses.map(c => {
    const compliance = Math.round((c.current / DATA.activeStaff) * 100);
    return `<tr>
      <td>${c.name}</td>
      <td>${c.current}</td>
      <td>${c.due}</td>
      <td>${c.expired}</td>
      <td>${c.failed}</td>
      <td>${c.notTaken}</td>
      <td><div class="progress"><strong>${compliance}%</strong>
        <div class="progress-track"><div class="progress-fill" style="width:${compliance}%"></div></div>
      </div></td>
    </tr>`;
  }).join('');

  document.getElementById('actionTableBody').innerHTML = DATA.actions.map(a => `
    <tr>
      <td>${a.name}</td>
      <td>${a.staffId}</td>
      <td>${a.issue}</td>
      <td>${a.coursesAffected}</td>
      <td>${a.nextAction}</td>
      <td><span class="status ${a.status}">${labelForStatus(a.status)}</span></td>
    </tr>`).join('');
}

function searchOfficer(){
  const id = document.getElementById('staffSearch').value.trim();
  const root = document.getElementById('officerResult');
  if(!id){
    root.className = 'officer-result empty-state';
    root.textContent = 'Enter a Staff ID to view an officer\'s induction training record.';
    return;
  }

  const officer = DATA.officers.find(o => o.staffId === id);
  if(!officer){
    root.className = 'officer-result empty-state';
    root.textContent = `No active officer found for Staff ID ${id}.`;
    return;
  }

  const courseMap = Object.fromEntries(DATA.courses.map(c => [c.id,c]));
  const currentCount = officer.courses.filter(c => c.status === 'current').length;
  const actionRequired = officer.courses.some(c => ['due','expired','failed','not-taken'].includes(c.status));

  root.className = 'officer-result';
  root.innerHTML = `
    <div class="officer-head">
      <div>
        <div class="officer-name">${officer.fullName}</div>
        <div class="officer-meta">Staff ID: ${officer.staffId}</div>
      </div>
      <div class="overall-status">
        Overall Induction Status
        <strong>${currentCount} / ${DATA.courses.length} Current — ${actionRequired ? 'Action Required' : 'Compliant'}</strong>
      </div>
    </div>
    <table>
      <thead><tr><th>Course</th><th>Status</th></tr></thead>
      <tbody>
        ${officer.courses.map(r => `
          <tr>
            <td>${courseMap[r.courseId]?.name || r.courseId}</td>
            <td><span class="status ${r.status}">${labelForStatus(r.status)}</span></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

document.getElementById('searchBtn').addEventListener('click', searchOfficer);
document.getElementById('staffSearch').addEventListener('keydown', e => { if(e.key === 'Enter') searchOfficer(); });
document.getElementById('navOfficerSearch').addEventListener('click', () => {
  document.getElementById('officerSearchPanel').scrollIntoView({behavior:'smooth'});
  document.getElementById('staffSearch').focus();
});
document.getElementById('exportBtn').addEventListener('click', () => window.print());

loadData().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend','<div style="padding:20px;color:#b00">Unable to load data.json</div>');
});
