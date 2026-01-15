import { API_URL } from '../utils/constants';

export const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_URL}/api/upload/photo`, {
        method: 'POST',
        body: formData
    });

    return response.json();
};

export const submitTeam = async (teamData) => {
    const response = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
    });

    return response.json();
};