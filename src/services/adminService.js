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
            id_number: m.id_number || '',  // This will be masked from GET /api/teams
            mobile: m.mobile || '',         // This will be masked from GET /api/teams
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

// ✅ NEW: Fetch single team with FULL unmasked details
// ✅ FIXED: Fetch single team with FULL unmasked details
export const fetchTeamFullDetails = async (teamId) => {
    try {
        console.log('Fetching full details for team ID:', teamId);

        const response = await fetch(`${API_URL}/api/teams/${teamId}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch team details');
        }

        const team = result.data;

        console.log('Raw team data from backend:', team);

        return {
            _id: team._id,
            team_name: team.team_name,
            members_count: team.members_count,
            submission_status: team.submission_status,
            submittedAt: team.created_at || team.createdAt,
            members: team.members.map(m => {
                // ✅ FIXED: Format DOB properly
                let formattedDob = '';
                if (m.dob) {
                    const date = new Date(m.dob);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    formattedDob = `${day}-${month}-${year}`; // DD-MM-YYYY
                }

                return {
                    name: m.name,
                    dob: formattedDob,  // ✅ Now formatted as DD-MM-YYYY
                    age: m.age,
                    gender: m.gender,
                    id_number: m.id_number,
                    mobile: m.mobile,
                    email: m.email,
                    state: m.state,
                    district: m.district,
                    city: m.city,
                    street: m.street,
                    doorno: m.doorno,
                    pincode: m.pincode,
                    nearest_ttd_temple: m.nearest_ttd_temple,
                    photo_path: m.photo_path,
                    photo: m.photo_path,
                    aadhaar_verified: m.aadhaar_verified
                };
            })
        };
    } catch (error) {
        console.error('Fetch team full details error:', error);
        throw error;
    }
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

// ✅ FIXED: Download JSON in exact required format (WITHOUT blood_group)
// ✅ FIXED: Download JSON with direct Cloudinary photo URLs
export const downloadTeamJSON = async (team) => {
    try {
        // Fetch full team details with unmasked data
        const fullTeam = await fetchTeamFullDetails(team._id);

        // ✅ Helper to format DOB as YYYY-MM-DD
        const formatDobForJSON = (dob, dobRaw) => {
            const dateToUse = dobRaw || dob;

            if (!dateToUse) return '';

            if (typeof dateToUse === 'string' && dateToUse.match(/^\d{2}-\d{2}-\d{4}$/)) {
                const [day, month, year] = dateToUse.split('-');
                return `${year}-${month}-${day}`;
            }

            const date = new Date(dateToUse);
            if (isNaN(date.getTime())) return '';

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // ✅ Create JSON with direct Cloudinary URLs
        const jsonData = {
            general: {
                group_size: fullTeam.members_count,
                auto_select_date: true,
                auto_download_ticket: true,
                respect_existing: true,
                aadhaar_autofill_wait_seconds: 4
            },
            members: fullTeam.members.map((m) => ({
                name: m.name || '',
                dob: formatDobForJSON(m.dob, m.dobRaw),
                age: String(m.age || ''),
                gender: m.gender || '',
                id_proof_type: 'Aadhaar',
                id_number: m.id_number || '',
                mobile: m.mobile || '',
                email: m.email || '',
                state: (m.state || '').toUpperCase(),
                district: (m.district || '').toUpperCase(),
                city: (m.city || '').toUpperCase(),
                street: (m.street || '').toUpperCase(),
                doorno: m.doorno || '',
                pincode: m.pincode || '',
                nearest_ttd_temple: m.nearest_ttd_temple || '',
                photo: m.photo_path || m.photo || ''  // ✅ Direct Cloudinary URL
            }))
        };

        // Download JSON file
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fullTeam.team_name.replace(/\s+/g, '_')}_Registration.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        console.log('✅ JSON downloaded with direct Cloudinary URLs');

    } catch (error) {
        console.error('❌ JSON download error:', error);
        alert('Failed to download JSON. Please try again.');
    }
};
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