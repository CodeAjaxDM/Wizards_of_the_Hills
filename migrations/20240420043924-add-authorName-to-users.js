// here I am tracking migrations I made in case other users need them for older branches.
// to run migrations one can use:
// npx sequelize-cli db:migrate:undo:all --env=development
// npx sequelize-cli db:migrate --env=development

// //1st migration
// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn('Users', 'authorName', {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.removeColumn('Users', 'authorName');
//   }
// };

// //2nd migration
// 'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     // Add isAdmin to Users table
//     await queryInterface.addColumn('Users', 'isAdmin', {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//       defaultValue: false
//     });

//     // Add published to Items table
//     await queryInterface.addColumn('Items', 'published', {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//       defaultValue: false
//     });

//     // Modify imageUrl to allow null in Items table
//     await queryInterface.changeColumn('Items', 'imageUrl', {
//       type: Sequelize.STRING,
//       allowNull: true
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     // Remove isAdmin from Users table
//     await queryInterface.removeColumn('Users', 'isAdmin');

//     // Remove published from Items table
//     await queryInterface.removeColumn('Items', 'published');

//     // Restore imageUrl to disallow null in Items table
//     await queryInterface.changeColumn('Items', 'imageUrl', {
//       type: Sequelize.STRING,
//       allowNull: false
//     });
//   }
// };


//3rd migration:

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Authors', 'authorImg', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '/images/author-img.jpg'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Authors', 'authorImg');
  }
};
