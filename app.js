
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


function parseDateSafe(value){
  if(!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateUK(value){
  const d = value instanceof Date ? value : parseDateSafe(value);
  return d ? d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';
}

function addMonths(date, months){
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth()+months);
  const lastDay = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  d.setDate(Math.min(originalDay,lastDay));
  return d;
}

function isOfficerFullyCurrent(officer){
  if(!officer || officer.courses.length !== DATA.courses.length) return false;
  return DATA.courses.every(course => {
    const record = officer.courses.find(r => r.courseId === course.id);
    return record && record.status === 'current' && record.lastPass;
  });
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
  const canCertify = isOfficerFullyCurrent(officer);

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
      <thead><tr><th>Course</th><th>Last Pass</th><th>Status</th></tr></thead>
      <tbody>
        ${officer.courses.map(r => `
          <tr>
            <td>${courseMap[r.courseId]?.name || r.courseId}</td>
            <td>${formatDateUK(r.lastPass)}</td>
            <td><span class="status ${r.status}">${labelForStatus(r.status)}</span></td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="certificate-action">
      <button class="primary-btn" id="generateCertificateBtn" ${canCertify ? '' : 'disabled'}>Generate Certificate</button>
      ${canCertify ? '' : '<span class="cert-disabled-note">Certificate available when all induction modules are Current.</span>'}
    </div>`;

  const certBtn = document.getElementById('generateCertificateBtn');
  if(certBtn && canCertify){
    certBtn.addEventListener('click', () => openCertificate(officer));
  }
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


function openCertificate(officer){
  const courseMap = Object.fromEntries(DATA.courses.map(c => [c.id,c]));
  const passes = DATA.courses.map(course => {
    const rec = officer.courses.find(r => r.courseId === course.id);
    return {course, rec};
  });

  if(!passes.every(x => x.rec && x.rec.status === 'current' && x.rec.lastPass)){
    alert('A certificate can only be generated when all induction modules are Current.');
    return;
  }

  const expiryDates = passes.map(x => addMonths(parseDateSafe(x.rec.lastPass), 12));
  const validUntil = new Date(Math.min(...expiryDates.map(d => d.getTime())));
  const issueDate = new Date();
  const ref = `IND-${officer.staffId}-${issueDate.getFullYear()}${String(issueDate.getMonth()+1).padStart(2,'0')}${String(issueDate.getDate()).padStart(2,'0')}`;

  document.getElementById('certOfficerName').textContent = officer.fullName;
  document.getElementById('certStaffId').textContent = officer.staffId;
  document.getElementById('certIssueDate').textContent = formatDateUK(issueDate);
  document.getElementById('certValidUntil').textContent = formatDateUK(validUntil);
  document.getElementById('certReference').textContent = ref;

  document.getElementById('certModules').innerHTML = passes.map(({course,rec}) => `
    <div class="certificate-module">
      <span>${course.name}</span>
      <span>Passed ${formatDateUK(rec.lastPass)}</span>
    </div>`).join('');

  const modal = document.getElementById('certificateModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function closeCertificate(){
  const modal = document.getElementById('certificateModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}



document.getElementById('closeCertificateBtn').addEventListener('click', closeCertificate);
document.getElementById('printCertificateBtn').addEventListener('click', () => window.print());
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeCertificate(); });

