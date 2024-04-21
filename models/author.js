const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');

class Author extends Model {
    static async updateSupportLink(authorName, supportLink) {
        try {
            const author = await Author.findByPk(authorName);
            if (author) {
                author.supportLink = supportLink;
                await author.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating support link:', error);
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
    supportLink: {
        type: DataTypes.STRING, // Store as a single string
        allowNull: false,
        defaultValue: "https://www.patreon.com/home", // Default value
        validate: {
            isURL: {
                args: true,
                msg: "Support link must be a valid URL"
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
