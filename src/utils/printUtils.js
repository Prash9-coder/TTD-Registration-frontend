export const printTeam = (team) => {
    const win = window.open('', '_blank', 'width=900,height=700');

    const css = `
    * { box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      background: #fff;
    }

    @page {
      size: A4;
      margin: 10mm 10mm 15mm 10mm;
    }

    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }

    .header {
      text-align: center;
      background: linear-gradient(90deg, #ea580c, #dc2626);
      color: white;
      padding: 28px 20px;
      margin-bottom: 20px;
      border-radius: 8px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }

    .team-name {
      margin-top: 5px;
      font-size: 17px;
    }

    .team-meta {
      margin-top: 3px;
      font-size: 13px;
      opacity: 0.9;
    }

    .member-card {
      height: 400px;
      border: 2px solid #d1d5db;
      border-radius: 10px;
      padding: 16px;
      margin: 10px auto;
      width: 95%;
      display: grid;
      grid-template-columns: 1fr 200px;
      gap: 15px;
      overflow: hidden;
      page-break-inside: avoid;
    }

    .member-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #1f2937;
    }

    .field {
      margin-bottom: 6px;
      font-size: 14px;
      color: #374151;
    }

    .label {
      font-weight: 600;
      color: #1f2937;
    }

    .member-photo {
      width: 190px;
      height: 230px;
      border-radius: 6px;
      object-fit: cover;
      border: 2px solid #9ca3af;
    }

    hr {
      border: none;
      border-bottom: 1px solid #e5e7eb;
      margin: 8px 0;
    }

    .page-break {
      page-break-after: always;
    }

    .no-photo {
      width: 190px;
      height: 230px;
      border-radius: 6px;
      background: linear-gradient(135deg, #e5e7eb, #d1d5db);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: bold;
      color: #6b7280;
      border: 2px solid #9ca3af;
    }
  `;

    let membersHtml = '';
    team.members.forEach((member, i) => {
        const photoHtml = member.photoPreview
            ? `<img class="member-photo" src="${member.photoPreview}" alt="${member.name}">`
            : `<div class="no-photo">${(member.name || '')[0] || '?'}</div>`;

        membersHtml += `
      <div class="member-card">
        <div>
          <div class="member-title">${member.name}</div>

          <div class="field"><span class="label">Aadhaar:</span> ${member.id_number}</div>
          <div class="field"><span class="label">DOB:</span> ${member.dob}</div>
          <div class="field"><span class="label">Age:</span> ${member.age}</div>
          <div class="field"><span class="label">Gender:</span> ${member.gender}</div>
          <div class="field"><span class="label">Mobile:</span> ${member.mobile}</div>
          <div class="field"><span class="label">Email:</span> ${member.email}</div>

          <hr>

          <div class="field"><span class="label">Door No:</span> ${member.doorno}</div>
          <div class="field"><span class="label">Street:</span> ${member.street}</div>
          <div class="field"><span class="label">City:</span> ${member.city}</div>
          <div class="field"><span class="label">District:</span> ${member.district}</div>
          <div class="field"><span class="label">State:</span> ${member.state}</div>
          <div class="field"><span class="label">Pincode:</span> ${member.pincode}</div>

          <div class="field"><span class="label">Nearest Temple:</span> ${member.nearest_ttd_temple}</div>
        </div>

        <div>
          ${photoHtml}
        </div>
      </div>
    `;

        // Page break after every 2 members
        if ((i + 1) % 2 === 0 && i !== team.members.length - 1) {
            membersHtml += `<div class="page-break"></div>`;
        }
    });

    win.document.write(`
    <html>
    <head>
      <title>Print - ${team.team_name}</title>
      <style>${css}</style>
    </head>
    <body>
      <div class="header">
        <h1>TTD Team Registration</h1>
        <div class="team-name">${team.team_name}</div>
        <div class="team-meta">Members: ${team.members_count}</div>
      </div>

      ${membersHtml}

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);

    win.document.close();
};