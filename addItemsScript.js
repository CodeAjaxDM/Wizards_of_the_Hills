//USE THIS FILE/ FORMAT TO ADD NEW ITEMS TO THE ITEMS TABLE!
//RUN: node addItemsScript.js
//when youve added your item. duplicates will be ignored, no need to delete anything
//sequelize doesnt like to add multiple items at once, so if you have more than 1 new addition, run the script multiple times!
const sequelize = require('./db'); // Import your database connection
const Item = require('./models/Item'); // Import the model

sequelize.sync().then(() => { // Make sure your database is synced before adding data
    console.log("Database synced!");

    // Create or find item
    Item.findOrCreate({
        where: { itemNumber: '001' },
        defaults: {
            name: 'The Owlfolk Expansion: Wings of Winter',
            price: 9.99,
            authorName: 'Jane Doe',
            authorWebsite: 'http://google.com',
            description: 'Dive into the frost-kissed realms of the Owlfolk with our captivating tabletop roleplaying game expansion:Wings of Winter". Venture into the heart of icy landscapes and uncover the enigmatic culture of these mystical avian beings. With "Wings of Winter", players can immerse themselves in the rich lore and traditions of the Owlfolk, unleashing new depths of roleplaying potential. Explore exclusive backgrounds, delve into unique race features, and harness a suite of spells crafted specifically for Owlfolk characters. Prepare to soar to new heights of adventure as you embrace the chilling winds of destiny with Wings of Winter - where magic and mystery intertwine amidst the snow-laden peaks.',
            imageUrl: '/images/owl.jpg',
            filePath: null,
            category: 'character options'
        }
    }).then(([item, created]) => {
        if (created) {
            console.log("Item added!");
        } else {
            console.log("Item already exists, not added!");
        }
    }).catch((error) => {
        console.error("Error handling item:", error);
    });

    Item.findOrCreate({
        where: { itemNumber: '002' },
        defaults: {
            name: 'Companion Animals Expanded (5e)',
            price: 0.00,
            authorName: 'Jane Doe',
            authorWebsite: 'http://google.com',
            description: 'Embark on a thrilling journey through uncharted realms with our groundbreaking Dungeons & Dragons 5th Edition expansion: "Companion Animals Expanded". Delve into the depths of mystique as you encounter an eclectic array of unique and peculiar companion animals, each brimming with newfound actions and abilities to enrich your gameplay experience. Our expansion boasts meticulously crafted content, honed through rigorous playtesting, ensuring seamless integration into your adventures. From the enigmatic Shadow Wisp to the majestic Stormcaller Gryphon, discover companions that defy convention and breathe new life into your campaigns. Unleash the power of the arcane, forge unbreakable bonds, and chart your destiny.',
            imageUrl: '/images/rat.jpg',
            filePath: null,
            category: 'rule books'
        }
    }).then(([item, created]) => {
        if (created) {
            console.log("Item added!");
        } else {
            console.log("Item already exists, not added!");
        }
    }).catch((error) => {
        console.error("Error handling item:", error);
    });

    Item.findOrCreate({
        where: { itemNumber: '003' },
        defaults: {
            name: 'Escape from Ethmoria',
            price: 22.39,
            authorName: 'Jane Doe',
            authorWebsite: 'http://google.com',
            description: 'Embark on a harrowing odyssey through the desolate lands of Ethmoria in "Escape from Ethmoria", a bone-chilling roleplaying game adventure that delves into the eerie aftermath of a fallen kingdom. Once ruled by a malevolent Lich Queen whose dark reign spanned centuries, Ethmoria now lies shattered and forsaken, haunted by the echoes of its sinister past. As brave adventurers, you must navigate treacherous landscapes and unravel the mysteries shrouding this forsaken realm, confronting vengeful spirits, eldritch horrors, and the lingering specter of the Lich Queen herself. Prepare to test the limits of courage and resilience as you chart a perilous course towards redemption or damnation in the haunted ruins of Ethmoria.',
            imageUrl: '/images/spooky.jpg',
            filePath: null,
            category: 'prewritten adventures'
        }
    }).then(([item, created]) => {
        if (created) {
            console.log("Item added!");
        } else {
            console.log("Item already exists, not added!");
        }
    }).catch((error) => {
        console.error("Error handling item:", error);
    });

    Item.findOrCreate({
        where: { itemNumber: '004' },
        defaults: {
            name: 'Next Level Spellbook',
            price: 12.49,
            authorName: 'Jane Doe',
            authorWebsite: 'http://google.com',
            description: 'Embark on a spellbinding journey to elevate your tabletop adventures with "Next Level Spellbook", the ultimate expansion for seasoned spellcasters and aspiring wizards alike. Unleash the arcane forces with hundreds of meticulously crafted spells, each designed to ignite new dimensions of creativity and excitement in your gameplay. From dazzling incantations that bend reality to whimsical charms that weave tales of wonder, "Next Level Spellbook" offers a treasure trove of magical possibilities. Explore diverse schools of magic, experiment with potent enchantments, and carve your path to mastery in the realms of fantasy. Elevate your spellcasting prowess to unprecedented heights and unlock boundless realms of imagination with "Next Level Spellbook" where every incantation opens the door to endless adventures.',
            imageUrl: '/images/wizard.jpeg',
            filePath: null,
            category: 'rule books'
        }
    }).then(([item, created]) => {
        if (created) {
            console.log("Item added!");
        } else {
            console.log("Item already exists, not added!");
        }
    }).catch((error) => {
        console.error("Error handling item:", error);
    });
});

