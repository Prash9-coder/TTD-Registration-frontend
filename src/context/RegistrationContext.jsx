import { create } from 'zustand';

export const useRegistrationStore = create((set) => ({
    currentStep: 1,
    currentMemberIndex: 0,
    teamData: {
        team_name: '',
        members_count: 0,
        consent_given: false,
        members: []
    },

    setCurrentStep: (step) => set({ currentStep: step }),
    setCurrentMemberIndex: (index) => set({ currentMemberIndex: index }),

    setTeamInfo: (name, count, consent) => set((state) => ({
        teamData: {
            ...state.teamData,
            team_name: name,
            members_count: count,
            consent_given: consent,
            members: Array(count).fill(null).map(() => ({
                name: '',
                dob: '',
                age: null,
                gender: '',
                id_proof_type: 'Aadhaar',
                id_number: '',
                mobile: '',
                email: '',
                state: '',
                district: '',
                city: '',
                street: '',
                doorno: '',
                pincode: '',
                nearest_ttd_temple: '',
                photo: null,
                photoPreview: null,
                photo_path: ''
            }))
        }
    })),

    updateMember: (index, data) => set((state) => ({
        teamData: {
            ...state.teamData,
            members: state.teamData.members.map((member, i) =>
                i === index ? { ...member, ...data } : member
            )
        }
    })),

    resetRegistration: () => set({
        currentStep: 1,
        currentMemberIndex: 0,
        teamData: {
            team_name: '',
            members_count: 0,
            consent_given: false,
            members: []
        }
    })
}));