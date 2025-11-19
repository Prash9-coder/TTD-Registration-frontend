import { API_URL } from '../utils/constants';

export const fetchAllTeams = async () => {
    const response = await fetch(`${API_URL}/api/teams`);
    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
        return [];
    }

    // Fetch details for each team
    const detailPromises = result.data.map(async (team) => {
        try {
            const detailResponse = await fetch(`${API_URL}/api/teams/${team._id}`);
            const detailResult = await detailResponse.json();
            return detailResult.success ? detailResult.data : null;
        } catch (error) {
            console.error('Team detail fetch error:', error);
            return null;
        }
    });

    const details = await Promise.all(detailPromises);
    const validTeams = details.filter(Boolean);

    // Map to consistent format
    return validTeams.map(team => ({
        _id: team._id,
        team_name: team.team_name || 'Unknown Team',
        members_count: team.members_count || (Array.isArray(team.members) ? team.members.length : 0),
        submission_status: team.submission_status || 'pending',
        submittedAt: team.created_at || team.createdAt || team.createdAtIso || null,
        members: Array.isArray(team.members) ? team.members.map(m => ({
            name: m.name || '',
            dob: m.dob ? new Date(m.dob).toISOString().split('T')[0] : '',
            age: m.age || '',
            gender: m.gender || '',
            id_number: m.id_number_full || m.id_number || '',
            mobile: m.mobile_full || m.mobile || '',
            email: m.email || '',
            state: m.state || '',
            district: m.district || '',
            city: m.city || '',
            street: m.street || '',
            doorno: m.doorno || '',
            pincode: m.pincode || '',
            nearest_ttd_temple: m.nearest_ttd_temple || '',
            photo_path: m.photo_path || '',
            photoPreview: m.photo_path ? `${API_URL}${m.photo_path}` : null
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

export const downloadTeamJSON = (team) => {
    const blob = new Blob([JSON.stringify(team, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${team.team_name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

export const downloadPhotosZip = async (team) => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();
    const folder = zip.folder(`${team.team_name.replace(/\s+/g, '_')}_Photos`);

    for (const member of team.members) {
        if (!member.photoPreview) continue;

        try {
            const response = await fetch(member.photoPreview);
            if (!response.ok) continue;

            const blob = await response.blob();
            const fileExt = blob.type.includes('png') ? 'png' : 'jpg';
            const safeName = (member.name || 'member').replace(/[^a-zA-Z0-9]/g, '_');

            folder.file(`${safeName}.${fileExt}`, blob);
        } catch (error) {
            console.error('Photo download failed:', error);
        }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${team.team_name.replace(/\s+/g, '_')}_Photos.zip`);
};