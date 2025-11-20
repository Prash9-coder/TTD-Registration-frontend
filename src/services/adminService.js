import { API_URL } from '../utils/constants';

export const fetchAllTeams = async () => {
    const response = await fetch(`${API_URL}/api/teams`);
    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
        return [];
    }

    return result.data.map(team => ({
        _id: team._id,
        team_name: team.team_name || 'Unknown Team',
        members_count: team.members_count || 0,
        submission_status: team.submission_status || 'pending',
        submittedAt: team.created_at || team.createdAt || null,
        members: Array.isArray(team.members) ? team.members.map(m => ({
            name: m.name || '',
            dob: m.dob ? new Date(m.dob).toISOString().split('T')[0] : '',
            age: m.age || '',
            gender: m.gender || '',
            id_number: m.id_number || '',
            mobile: m.mobile || '',
            email: m.email || '',
            state: m.state || '',
            district: m.district || '',
            city: m.city || '',
            street: m.street || '',
            doorno: m.doorno || '',
            pincode: m.pincode || '',
            nearest_ttd_temple: m.nearest_ttd_temple || '',
            photo_path: m.photo_path || null,
            photo: m.photo_path || null
        })) : []
    }));
};

export const verifyTeam = async (teamId) => {
    const response = await fetch(`${API_URL}/api/teams/${teamId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
};

export const deleteTeam = async (teamId) => {
    const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
        method: 'DELETE'
    });
    return response.json();
};

// ✅ FIXED: Fetch full team details before downloading JSON
export const downloadTeamJSON = async (team) => {
    try {
        // Fetch full team details with unmasked data
        const response = await fetch(`${API_URL}/api/teams/${team._id}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error('Failed to fetch full team details');
        }

        const fullTeam = result.data;

        // Create JSON with full data
        const jsonData = {
            team_id: fullTeam._id,
            team_name: fullTeam.team_name,
            members_count: fullTeam.members_count,
            submission_status: fullTeam.submission_status,
            registered_date: fullTeam.created_at,
            members: fullTeam.members.map(m => ({
                name: m.name,
                date_of_birth: m.dob,
                age: m.age,
                gender: m.gender,
                aadhaar_number: m.id_number,  // ✅ Full Aadhaar (from GET /api/teams/:id)
                mobile_number: m.mobile,      // ✅ Full Mobile (from GET /api/teams/:id)
                email: m.email,
                address: {
                    door_no: m.doorno,
                    street: m.street,
                    city: m.city,
                    district: m.district,
                    state: m.state,
                    pincode: m.pincode
                },
                nearest_ttd_temple: m.nearest_ttd_temple,
                photo_url: m.photo_path,
                aadhaar_verified: m.aadhaar_verified || false
            }))
        };

        // Download JSON file
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fullTeam.team_name.replace(/\s+/g, '_')}_Full_Details.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        console.log('✅ JSON downloaded with full details');

    } catch (error) {
        console.error('❌ JSON download error:', error);
        alert('Failed to download JSON with full details');
    }
};

// ✅ FIXED: Use photo_path for ZIP download
export const downloadPhotosZip = async (team) => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();
    const folder = zip.folder(`${team.team_name.replace(/\s+/g, '_')}_Photos`);

    let successCount = 0;
    let failCount = 0;

    for (const member of team.members) {
        const photoUrl = member.photo_path || member.photo;

        if (!photoUrl) {
            console.warn(`No photo for ${member.name}`);
            failCount++;
            continue;
        }

        try {
            console.log(`Downloading photo for ${member.name}:`, photoUrl);

            const response = await fetch(photoUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            const fileExt = blob.type.includes('png') ? 'png' : 'jpg';
            const safeName = (member.name || 'member').replace(/[^a-zA-Z0-9]/g, '_');

            folder.file(`${safeName}.${fileExt}`, blob);
            successCount++;

        } catch (error) {
            console.error(`Failed to download photo for ${member.name}:`, error);
            failCount++;
        }
    }

    if (successCount === 0) {
        alert('No photos could be downloaded!');
        return;
    }

    console.log(`✅ Downloaded ${successCount} photos, ${failCount} failed`);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${team.team_name.replace(/\s+/g, '_')}_Photos.zip`);
};