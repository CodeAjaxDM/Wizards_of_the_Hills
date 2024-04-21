const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');

class Author extends Model {
    static async updateSupportLinks(authorName, supportLinks) {
        try {
            const author = await Author.findByPk(authorName);
            if (author) {
                author.supportLinks = supportLinks;
                await author.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating support links:', error);
            return false;
        }
    }
}

Author.init({
    authorName: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    supportLinks: {
        type: DataTypes.JSON, // Store as JSON array of links
        allowNull: false,
        defaultValue: ["https://www.patreon.com/home"], // Default value
        validate: {
            validateLinks(value) {
                if (!Array.isArray(value) || value.length === 0 || value.length > 3) {
                    throw new Error('Support links must be an array with 1 to 3 entries');
                }
                value.forEach(link => {
                    if (typeof link !== 'string') {
                        throw new Error('Each support link must be a string');
                    }
                });
            }
        }
    },
    about: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "I don't like to talk about myself"
    },
    authorImg: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '/images/author-img.jpg'
    }
}, {
    sequelize,
    modelName: 'Author'
});

module.exports = Author;
