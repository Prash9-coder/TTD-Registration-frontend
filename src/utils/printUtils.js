import { getImageUrl } from './imageHelper';

export const printTeam = async (team) => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || 'https://ttd-registration.onrender.com';
    const response = await fetch(`${API_URL}/api/teams/${team._id}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error('Failed to fetch full team details');
    }

    const fullTeam = result.data;

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
      
      img {
        max-width: 100% !important;
        page-break-inside: avoid;
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
      min-height: 400px;
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
      display: block;
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

    // ✅ Helper function to format DOB
    const formatDOB = (dob) => {
      if (!dob) return 'N/A';

      // If already formatted as DD-MM-YYYY, return as is
      if (typeof dob === 'string' && dob.match(/^\d{2}-\d{2}-\d{4}$/)) {
        return dob;
      }

      // Otherwise format it
      const date = new Date(dob);
      if (isNaN(date.getTime())) return 'N/A';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    let membersHtml = '';

    fullTeam.members.forEach((member, i) => {
      const photoUrl = getImageUrl(member.photo_path || member.photo);

      const photoHtml = photoUrl
        ? `<img class="member-photo" src="${photoUrl}" alt="${member.name}" crossorigin="anonymous">`
        : `<div class="no-photo">${(member.name || '')[0] || '?'}</div>`;

      membersHtml += `
      <div class="member-card">
        <div>
          <div class="member-title">${member.name}</div>

          <div class="field"><span class="label">Aadhaar:</span> ${member.id_number}</div>
          <div class="field"><span class="label">DOB:</span> ${formatDOB(member.dob)}</div>
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

      if ((i + 1) % 2 === 0 && i !== fullTeam.members.length - 1) {
        membersHtml += `<div class="page-break"></div>`;
      }
    });

    win.document.write(`
    <html>
    <head>
      <title>Print - ${fullTeam.team_name}</title>
      <meta charset="UTF-8">
      <style>${css}</style>
    </head>
    <body>
      <div class="header">
        <h1>TTD Team Registration</h1>
        <div class="team-name">${fullTeam.team_name}</div>
        <div class="team-meta">Members: ${fullTeam.members_count}</div>
      </div>

      ${membersHtml}

      <script>
        window.onload = function() {
          var images = document.getElementsByTagName('img');
          var loadedImages = 0;
          var totalImages = images.length;

          if (totalImages === 0) {
            setTimeout(function() {
              window.print();
            }, 500);
            return;
          }

          function imageLoaded() {
            loadedImages++;
            console.log('Loaded ' + loadedImages + '/' + totalImages + ' images');
            
            if (loadedImages === totalImages) {
              console.log('All images loaded, printing...');
              setTimeout(function() {
                window.print();
              }, 1000);
            }
          }

          for (var i = 0; i < images.length; i++) {
            if (images[i].complete) {
              imageLoaded();
            } else {
              images[i].addEventListener('load', imageLoaded);
              images[i].addEventListener('error', function() {
                console.error('Image failed to load:', this.src);
                imageLoaded();
              });
            }
          }

          setTimeout(function() {
            if (loadedImages < totalImages) {
              console.warn('Timeout: Printing with ' + loadedImages + '/' + totalImages + ' images loaded');
              window.print();
            }
          }, 5000);
        };
      </script>
    </body>
    </html>
  `);

    win.document.close();

  } catch (error) {
    console.error('❌ Print error:', error);
    alert('Failed to prepare print view. Please try again.');
  }
};