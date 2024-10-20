// backend/models/acesso.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Acesso extends Model {
        static associate(models) {
            Acesso.belongsTo(models.Corretor, { foreignKey: 'corretorId', as: 'corretor' });
            Acesso.belongsTo(models.Correspondente, { foreignKey: 'correspondenteId', as: 'correspondente' });
            Acesso.belongsTo(models.Administrador, { foreignKey: 'administradorId', as: 'administrador' });
        }
    }

    Acesso.init({
        ip: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        referer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        
        corretorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'corretores',
                key: 'id'
            }
        },
        correspondenteId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'correspondentes',
                key: 'id'
            }
        },
        administradorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'administradores',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Acesso',
        tableName: 'acessos',
        timestamps: false,
    });

    return Acesso;
};
