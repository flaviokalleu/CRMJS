import { useState, useEffect } from 'react';
import axios from 'axios';

const useUser = () => {
    const [userId, setUserId] = useState(null);
    const [userType, setUserType] = useState(null); // Adicione userType
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/me`);
                setUserId(response.data.id);
                setUserType(response.data.type); // Assumindo que a resposta inclui o tipo de usuário
                setLoading(false);
            } catch (err) {
                setError('Erro ao buscar informações do usuário.');
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { userId, userType, loading, error }; // Inclua userType
};

export default useUser;
