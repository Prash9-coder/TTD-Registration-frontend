import { getImageUrl } from './imageHelper';

// ✅ Lord Venkateswara Background Image URL
const VENKATESWARA_BG_IMAGE =
  'https://res.cloudinary.com/dnly2saob/image/upload/v1/ttd-registrations/lord-venkateswara-bg.png';

/**
 * Print team WITH Lord Venkateswara transparent background watermark
 */
export const printTeamWithTransparentBackground = async (team) => {
  return printTeam(team, true);
};

/**
 * Generate member card HTML
 */
const generateMemberCardHtml = (member, memberNum, useVenkateswaraBg) => {
  const photo = getImageUrl(member.photo_path || member.photo);
  
  const formatDOB = (dob) => {
    if (!dob) return 'N/A';
    if (typeof dob === 'string' && dob.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return dob;
    }
    const d = new Date(dob);
    if (isNaN(d.getTime())) return 'N/A';
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const photoHtml = photo
    ? `<img class="member-photo" src="${photo}" alt="${member.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="no-photo" style="display:none;">${(member.name || '?')[0]}</div>`
    : `<div class="no-photo">${(member.name || '?')[0]}</div>`;

  return `
<div class="member-card">
  <div class="member-details">
    <div class="member-title">Member ${memberNum}: ${member.name || 'N/A'}</div>
    <div class="member-info">
      <div class="field"><span class="label">Aadhaar Number:</span> ${member.id_number || 'N/A'}</div>
      <div class="field"><span class="label">Date of Birth:</span> ${formatDOB(member.dob)}</div>
      <div class="field"><span class="label">Age:</span> ${member.age || 'N/A'}</div>
      <div class="field"><span class="label">Gender:</span> ${member.gender || 'N/A'}</div>
      <div class="field"><span class="label">Mobile Number:</span> ${member.mobile || 'N/A'}</div>
      <div class="field"><span class="label">Email:</span> ${member.email || 'N/A'}</div>
      <hr>
      <div class="field"><span class="label">Door No:</span> ${member.doorno || 'N/A'}</div>
      <div class="field"><span class="label">Street:</span> ${member.street || 'N/A'}</div>
      <div class="field"><span class="label">City:</span> ${member.city || 'N/A'}</div>
      <div class="field"><span class="label">District:</span> ${member.district || 'N/A'}</div>
      <div class="field"><span class="label">State:</span> ${member.state || 'N/A'}</div>
      <div class="field"><span class="label">Pincode:</span> ${member.pincode || 'N/A'}</div>
      <hr>
      <div class="field"><span class="label">Nearest TTD Temple:</span> ${member.nearest_ttd_temple || 'N/A'}</div>
    </div>
  </div>
  <div class="member-photo-section">
    ${photoHtml}
  </div>
</div>`;
};

/**
 * Generate empty slot HTML
 */
const generateEmptySlotHtml = () => {
  return `
<div class="member-card" style="visibility: hidden;">
  <div class="member-details">
    <div class="member-title">--</div>
  </div>
  <div class="member-photo-section">
    <div class="no-photo">--</div>
  </div>
</div>`;
};

/**
 * Generate page HTML
 */
const generatePageHtml = (fullTeam, pageNum, totalPages, perPage, useVenkateswaraBg) => {
  const isFirst = pageNum === 0;
  const isLast = pageNum === totalPages - 1;
  const slice = fullTeam.members.slice(pageNum * perPage, (pageNum + 1) * perPage);

  let pageHtml = `<div class="page-container ${isLast ? 'last-page' : ''}">`;

  // Header only on first page
  if (isFirst) {
    pageHtml += `
<div class="header">
  <h1>🕉️ TTD Team Registration</h1>
  <div class="team-name">${fullTeam.team_name || 'Unknown Team'}</div>
  <div class="team-meta">Total Members: ${fullTeam.members_count || fullTeam.members.length} | Status: ${fullTeam.submission_status || 'Pending'}</div>
</div>`;

    if (useVenkateswaraBg) {
      pageHtml += `<div class="divine-blessing">🙏 ఓం నమో వేంకటేశాయ | Om Namo Venkatesaya 🙏</div>`;
    }
  }

  // Members wrapper
  pageHtml += `<div class="members-wrapper">`;

  // Generate member cards using map
  const memberCardsHtml = slice.map((member, index) => {
    const memberNum = pageNum * perPage + index + 1;
    return generateMemberCardHtml(member, memberNum, useVenkateswaraBg);
  }).join('');

  pageHtml += memberCardsHtml;

  // Add empty slot if only one member on this page
  if (slice.length === 1) {
    pageHtml += generateEmptySlotHtml();
  }

  pageHtml += `</div>`; // Close members-wrapper

  // Page number
  pageHtml += `<div class="page-number">Page ${pageNum + 1}/${totalPages}</div>`;

  // Footer only on last page
  if (isLast) {
    const printDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    pageHtml += `
<div class="footer">
  ${useVenkateswaraBg ? '🙏 Govinda Govinda 🙏 | ' : ''}
  Printed on: ${printDate}
</div>`;
  }

  pageHtml += `</div>`; // Close page-container

  return pageHtml;
};

/**
 * Main print function
 */
export const printTeam = async (team, useVenkateswaraBg = false) => {
  try {
    const API_URL =
      process.env.REACT_APP_API_URL ||
      'https://ttd-registration.onrender.com';

    const response = await fetch(`${API_URL}/api/teams/${team._id}`);
    const result = await response.json();

    if (!result.success) throw new Error('Failed to fetch team');

    const fullTeam = result.data;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) throw new Error('Popup blocked');

    /* ===================== CSS ===================== */
    const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
    width: 100%;
    height: 100%;
}

body {
    font-family: Arial, 'Segoe UI', sans-serif;
    background: #fff;
    color: #000;
    position: relative;
    line-height: 1.25;
}

/* 🔱 LORD VENKATESWARA WATERMARK – EVERY PAGE */
${useVenkateswaraBg ? `
body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url('${VENKATESWARA_BG_IMAGE}');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 45%;
    opacity: 0.06;
    z-index: -1;
    pointer-events: none;
}
` : ''}

/* A4 SETUP */
@page {
    size: A4;
    margin: 10mm 8mm 12mm 8mm;
}

@media print {
    html, body {
        height: auto;
    }

    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    ${useVenkateswaraBg ? `
    body::before {
        position: fixed !important;
        background-size: 45% !important;
        opacity: 0.06 !important;
    }
    ` : ''}

    .page-container {
        page-break-after: always;
    }

    .page-container.last-page {
        page-break-after: avoid;
    }

    img {
        page-break-inside: avoid;
    }
    
    .member-card {
        page-break-inside: avoid;
    }
}

/* PAGE */
.page-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 6px;
}

/* HEADER */
.header {
    text-align: center;
    background: linear-gradient(90deg, #ea580c, #dc2626);
    color: #fff;
    padding: 18px 12px;
    border-radius: 6px;
    margin-bottom: 10px;
}

.header h1 { 
    font-size: 22px; 
    margin-bottom: 4px;
}

.team-name { 
    font-size: 16px; 
    font-weight: 600; 
    margin-top: 4px; 
}

.team-meta {
    font-size: 12px;
    margin-top: 4px;
    opacity: 0.95;
}

/* DIVINE BLESSING */
.divine-blessing {
    text-align: center;
    margin: 8px 0;
    padding: 6px;
    font-size: 13px;
    font-style: italic;
    color: #ea580c;
    font-weight: 600;
}

/* MEMBERS */
.members-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 4px;
}

.member-card {
    display: grid;
    grid-template-columns: 1fr 165px;
    gap: 10px;
    padding: 10px 12px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    background: rgba(255,255,255,0.98);
    page-break-inside: avoid;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    position: relative;
    flex: 1;
    max-height: calc(50% - 8px);
}

${useVenkateswaraBg ? `
.member-card::after {
    content: '🕉️';
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 16px;
    opacity: 0.2;
}
` : ''}

.member-details {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.member-title {
    font-size: 15px;
    font-weight: 700;
    border-bottom: 1.5px solid #f97316;
    padding-bottom: 4px;
    margin-bottom: 6px;
    color: #1f2937;
}

.member-info {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 3px;
    padding-bottom: 5px;
}

.field {
    font-size: 11.5px;
    margin-bottom: 3px;
    color: #374151;
    line-height: 1.35;
    word-break: break-word;
}

.label {
    font-weight: 600;
    color: #1f2937;
    min-width: 100px;
    display: inline-block;
    font-size: 11px;
}

hr {
    border: none;
    border-bottom: 1px solid #e5e7eb;
    margin: 4px 0;
}

/* PHOTO */
.member-photo-section {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 5px;
}

.member-photo {
    width: 150px;
    height: 180px;
    object-fit: cover;
    border-radius: 5px;
    border: 1.5px solid #9ca3af;
}

.no-photo {
    width: 150px;
    height: 180px;
    background: linear-gradient(135deg,#f97316,#dc2626);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: bold;
    border-radius: 5px;
    border: 1.5px solid #9ca3af;
    text-transform: uppercase;
}

/* PAGE NUMBER */
.page-number {
    text-align: right;
    font-size: 10px;
    margin-top: auto;
    padding: 5px 10px;
    color: #6b7280;
}

/* FOOTER */
.footer {
    text-align: center;
    font-size: 11px;
    margin-top: auto;
    border-top: 1px solid #e5e7eb;
    padding: 6px;
    color: #6b7280;
}

/* SCROLLBAR */
.member-info::-webkit-scrollbar {
    width: 3px;
}

.member-info::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.member-info::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}
`;

    /* =============== GENERATE HTML ================= */
    const perPage = 2;
    const totalPages = Math.ceil(fullTeam.members.length / perPage);

    // Generate all pages using Array.from and map (no loop variable issues)
    const allPagesHtml = Array.from({ length: totalPages }, (_, pageNum) => 
      generatePageHtml(fullTeam, pageNum, totalPages, perPage, useVenkateswaraBg)
    ).join('');

    /* =============== WRITE ================= */
    win.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print - ${fullTeam.team_name || 'Team Registration'}</title>
  <style>${css}</style>
</head>
<body>
${allPagesHtml}
<script>
console.log('Print utility loaded - 2 members per page');
window.onload = function() {
  var images = document.getElementsByTagName('img');
  var loadedImages = 0;
  var totalImages = images.length;

  if (totalImages === 0) {
    setTimeout(function() { window.print(); }, 500);
    return;
  }

  function checkAndPrint() {
    loadedImages++;
    if (loadedImages === totalImages) {
      setTimeout(function() { window.print(); }, 1000);
    }
  }

  for (var i = 0; i < images.length; i++) {
    if (images[i].complete && images[i].naturalHeight !== 0) {
      checkAndPrint();
    } else {
      images[i].addEventListener('load', checkAndPrint);
      images[i].addEventListener('error', checkAndPrint);
    }
  }

  // Fallback print after 8 seconds
  setTimeout(function() {
    if (loadedImages < totalImages) {
      window.print();
    }
  }, 8000);
};
</script>
</body>
</html>`);

    win.document.close();
    
    console.log('✅ Print window opened');
    console.log('📄 Team:', fullTeam.team_name);
    console.log('👥 Members:', fullTeam.members_count);
    console.log('📄 Pages:', totalPages);
    
  } catch (error) {
    console.error('❌ Print error:', error);
    alert(`Failed to print: ${error.message}`);
  }
};

/* ================= SINGLE MEMBER ================= */
export const printMember = async (member, teamName = 'Team', useVenkateswaraBg = false) => {
  try {
    const win = window.open('', '_blank', 'width=600,height=800');
    if (!win) throw new Error('Popup blocked');

    const photoUrl = getImageUrl(member.photo_path || member.photo);
    const fallbackInitial = (member.name || '?')[0];

    const formatDOB = (dob) => {
      if (!dob) return 'N/A';
      if (typeof dob === 'string' && dob.match(/^\d{2}-\d{2}-\d{4}$/)) return dob;
      const date = new Date(dob);
      if (isNaN(date.getTime())) return 'N/A';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: Arial, sans-serif;
        padding: 15px;
        position: relative;
        line-height: 1.3;
      }
      ${useVenkateswaraBg ? `
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('${VENKATESWARA_BG_IMAGE}');
        background-size: 60%;
        background-position: center center;
        background-repeat: no-repeat;
        opacity: 0.06;
        z-index: -1;
      }
      ` : ''}
      .header { 
        text-align: center; 
        background: linear-gradient(90deg, #ea580c, #dc2626); 
        color: white; 
        padding: 15px; 
        border-radius: 6px; 
        margin-bottom: 15px; 
      }
      .photo { 
        width: 180px; 
        height: 220px; 
        margin: 15px auto; 
        display: block; 
        border-radius: 6px; 
        object-fit: cover; 
        border: 1.5px solid #ccc; 
      }
      .no-photo { 
        width: 180px; 
        height: 220px; 
        margin: 15px auto; 
        background: linear-gradient(135deg, #f97316, #dc2626); 
        border-radius: 6px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 70px; 
        color: white; 
        font-weight: bold; 
      }
      .field { margin: 8px 0; font-size: 13px; }
      .label { font-weight: bold; display: inline-block; min-width: 130px; }
      @media print {
        body { padding: 10px; }
        ${useVenkateswaraBg ? `
        body::before {
          position: fixed;
          opacity: 0.06;
        }
        ` : ''}
      }
    `;

    const photoHtml = photoUrl
      ? `<img class="photo" src="${photoUrl}" alt="${member.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="no-photo" style="display:none;">${fallbackInitial}</div>`
      : `<div class="no-photo">${fallbackInitial}</div>`;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print - ${member.name}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="header">
          <h1>${teamName}</h1>
          <h2>${member.name || 'N/A'}</h2>
        </div>
        ${photoHtml}
        <div class="field"><span class="label">Aadhaar:</span> ${member.id_number || 'N/A'}</div>
        <div class="field"><span class="label">DOB:</span> ${formatDOB(member.dob)}</div>
        <div class="field"><span class="label">Age:</span> ${member.age || 'N/A'}</div>
        <div class="field"><span class="label">Gender:</span> ${member.gender || 'N/A'}</div>
        <div class="field"><span class="label">Mobile:</span> ${member.mobile || 'N/A'}</div>
        <div class="field"><span class="label">Email:</span> ${member.email || 'N/A'}</div>
        <div class="field"><span class="label">Address:</span> ${member.doorno || ''}, ${member.street || ''}, ${member.city || ''}, ${member.district || ''}, ${member.state || ''} - ${member.pincode || ''}</div>
        <div class="field"><span class="label">Nearest Temple:</span> ${member.nearest_ttd_temple || 'N/A'}</div>
        ${useVenkateswaraBg ? '<div style="text-align:center;margin-top:15px;color:#ea580c;">🙏 Govinda Govinda 🙏</div>' : ''}
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 1000); };</script>
      </body>
      </html>
    `);

    win.document.close();

  } catch (error) {
    console.error('❌ Print member error:', error);
    alert('Failed to print member details');
  }
};

/* ✅ Export utilities */
const printUtils = {
  printTeam,
  printTeamWithTransparentBackground,
  printMember,
};

export default printUtils;