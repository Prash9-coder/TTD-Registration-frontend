import { API_URL } from '../utils/constants';

// ✅ Helper function to safely format dates
const formatDateSafe = (dateStr) => {
    if (!dateStr) return '';
    
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // If in DD-MM-YYYY format, convert to YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    }
    
    // If in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }
    
    // Try to parse as Date
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        console.warn('Could not parse date:', dateStr);
    }
    
    // Return as-is if can't parse
    return dateStr;
};

// ✅ Fetch all teams (with masked sensitive data)
export const fetchAllTeams = async () => {
    try {
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
            admin_notes: team.admin_notes || '',
            members: Array.isArray(team.members) ? team.members.map(m => ({
                name: m.name || '',
                dob: formatDateSafe(m.dob),  // ✅ FIXED - Safe date formatting
                age: m.age || '',
                gender: m.gender || '',
                id_number: m.id_number || m.id_number_masked || '',
                id_number_masked: m.id_number_masked || '',
                id_number_full: m.id_number_full || m.id_number || '',
                mobile: m.mobile || m.mobile_masked || '',
                mobile_masked: m.mobile_masked || '',
                mobile_full: m.mobile_full || m.mobile || '',
                email: m.email || '',
                state: m.state || '',
                district: m.district || '',
                city: m.city || '',
                street: m.street || '',
                doorno: m.doorno || '',
                pincode: m.pincode || '',
                nearest_ttd_temple: m.nearest_ttd_temple || '',
                photo_path: m.photo_path || m.photo || null,
                photo: m.photo_path || m.photo || null
            })) : []
        }));
    } catch (error) {
        console.error('Fetch all teams error:', error);
        return [];
    }
};

// ✅ Fetch single team with FULL unmasked details
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
            admin_notes: team.admin_notes || '',
            members: team.members.map(m => ({
                name: m.name || '',
                dob: m.dob || '',  // ✅ Keep as-is (DD-MM-YYYY)
                dobRaw: m.dob,     // ✅ Keep raw for JSON export
                age: m.age || '',
                gender: m.gender || '',
                id_number: m.id_number || m.id_number_full || '',
                id_number_full: m.id_number_full || m.id_number || '',
                id_number_masked: m.id_number_masked || '',
                mobile: m.mobile || m.mobile_full || '',
                mobile_full: m.mobile_full || m.mobile || '',
                mobile_masked: m.mobile_masked || '',
                email: m.email || '',
                state: m.state || '',
                district: m.district || '',
                city: m.city || '',
                street: m.street || '',
                doorno: m.doorno || '',
                pincode: m.pincode || '',
                nearest_ttd_temple: m.nearest_ttd_temple || '',
                photo_path: m.photo_path || m.photo || '',
                photo: m.photo_path || m.photo || '',
                aadhaar_verified: m.aadhaar_verified || false
            }))
        };
    } catch (error) {
        console.error('Fetch team full details error:', error);
        throw error;
    }
};

// ✅ Verify team
export const verifyTeam = async (teamId) => {
    try {
        const response = await fetch(`${API_URL}/api/teams/${teamId}/verify`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error('Verify team error:', error);
        return { success: false, message: 'Network error' };
    }
};

// ✅ Delete team
export const deleteTeam = async (teamId) => {
    try {
        const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Delete team error:', error);
        return { success: false, message: 'Network error' };
    }
};

// ✅ Update team
export const updateTeam = async (teamId, updates) => {
    try {
        const payload = {
            ...updates,
            members: updates.members?.map(m => ({
                name: m.name,
                dob: m.dob,
                age: m.age,
                gender: m.gender,
                id_number: m.id_number_full || m.id_number,
                id_number_full: m.id_number_full || m.id_number,
                mobile: m.mobile_full || m.mobile,
                mobile_full: m.mobile_full || m.mobile,
                email: m.email,
                state: m.state,
                district: m.district,
                city: m.city,
                street: m.street,
                doorno: m.doorno,
                pincode: m.pincode,
                nearest_ttd_temple: m.nearest_ttd_temple,
                photo_path: m.photo_path || m.photo,
                photo: m.photo_path || m.photo
            }))
        };

        console.log('Update payload:', payload);

        const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Update team error:', error);
        return { success: false, message: 'Network error' };
    }
};

// ✅ Download team data as JSON (for automation)
export const downloadTeamJSON = async (team) => {
    try {
        const fullTeam = await fetchTeamFullDetails(team._id);

        const formatDobForJSON = (dob, dobRaw) => {
            const dateToUse = dobRaw || dob;
            if (!dateToUse) return '';

            if (typeof dateToUse === 'string' && dateToUse.match(/^\d{2}-\d{2}-\d{4}$/)) {
                const [day, month, year] = dateToUse.split('-');
                return `${year}-${month}-${day}`;
            }

            try {
                const date = new Date(dateToUse);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
            } catch (e) {
                console.warn('Date parse error:', e);
            }

            return '';
        };

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
                photo: m.photo_path || m.photo || ''
            }))
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fullTeam.team_name.replace(/\s+/g, '_')}_Registration.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        console.log('✅ JSON downloaded successfully');

    } catch (error) {
        console.error('❌ JSON download error:', error);
        throw error;
    }
};

// ✅ Download all member photos as ZIP
export const downloadPhotosZip = async (team) => {
    try {
        const JSZip = (await import('jszip')).default;
        const { saveAs } = await import('file-saver');

        const zip = new JSZip();
        const folderName = `${team.team_name.replace(/\s+/g, '_')}_Photos`;
        const folder = zip.folder(folderName);

        let successCount = 0;
        let failCount = 0;

        console.log(`Starting download of ${team.members.length} photos...`);

        for (let i = 0; i < team.members.length; i++) {
            const member = team.members[i];
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
                const safeName = (member.name || `member_${i + 1}`).replace(/[^a-zA-Z0-9]/g, '_');

                folder.file(`${safeName}.${fileExt}`, blob);
                successCount++;
                console.log(`✅ Downloaded: ${safeName}.${fileExt}`);

            } catch (error) {
                console.error(`❌ Failed to download photo for ${member.name}:`, error);
                failCount++;
            }
        }

        if (successCount === 0) {
            throw new Error('No photos could be downloaded!');
        }

        console.log(`✅ Downloaded ${successCount} photos, ${failCount} failed`);

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${folderName}.zip`);

        return { success: true, successCount, failCount };

    } catch (error) {
        console.error('❌ Photo ZIP download error:', error);
        throw error;
    }
};