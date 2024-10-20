// components/DashboardCard.js
import React from 'react';

const DashboardCard = ({ icon, title, value, iconColor }) => {
    return (
        <div className='bg-gray-800 p-6 rounded-lg shadow-lg flex items-center'>
            <svg className={`h-10 w-10 ${iconColor} mr-4`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                {icon}
            </svg>
            <div>
                <h2 className='text-xl font-semibold mb-2'>{title}</h2>
                <p className='text-2xl font-bold'>{value}</p>
            </div>
        </div>
    );
};

export default DashboardCard;
