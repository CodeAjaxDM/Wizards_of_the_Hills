const sequelize = require('./db'); // Import your database connection
const Item = require('./models/Item'); // Import the model

async function addItems() {
    await sequelize.sync(); // Make sure your database is synced before adding data
    console.log("Database synced!");

    async function addItem(itemData) {
        try {
            const [item, created] = await Item.findOrCreate({
                where: { itemNumber: itemData.itemNumber },
                defaults: itemData.defaults
            });
            if (created) {
                console.log(`Item ${itemData.itemNumber} added!`);
            } else {
                console.log(`Item ${itemData.itemNumber} already exists, not added!`);
            }
        } catch (error) {
            console.error("Error handling item:", error);
        }
    }

    const itemsToAdd = [
        {
            itemNumber: '001',
            defaults: {
                name: 'The Owlfolk Expansion: Wings of Winter',
                price: 9.99,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Dive into the frost-kissed realms of the Owlfolk with our captivating tabletop roleplaying game expansion:Wings of Winter". Venture into the heart of icy landscapes and uncover the enigmatic culture of these mystical avian beings. With "Wings of Winter", players can immerse themselves in the rich lore and traditions of the Owlfolk, unleashing new depths of roleplaying potential. Explore exclusive backgrounds, delve into unique race features, and harness a suite of spells crafted specifically for Owlfolk characters. Prepare to soar to new heights of adventure as you embrace the chilling winds of destiny with Wings of Winter - where magic and mystery intertwine amidst the snow-laden peaks.',
                imageUrl: '/images/owl.jpg',
                filePath: null,
                category: 'character options',
                published: 1
            }
        },
        {
            itemNumber: '002',
            defaults: {
                name: 'Companion Animals Expanded (5e)',
                price: 0.00,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Embark on a thrilling journey through uncharted realms with our groundbreaking Dungeons & Dragons 5th Edition expansion: "Companion Animals Expanded". Delve into the depths of mystique as you encounter an eclectic array of unique and peculiar companion animals, each brimming with newfound actions and abilities to enrich your gameplay experience. Our expansion boasts meticulously crafted content, honed through rigorous playtesting, ensuring seamless integration into your adventures. From the enigmatic Shadow Wisp to the majestic Stormcaller Gryphon, discover companions that defy convention and breathe new life into your campaigns. Unleash the power of the arcane, forge unbreakable bonds, and chart your destiny.',
                imageUrl: '/images/rat.jpg',
                filePath: null,
                category: 'rule books',
                published: 1
            }
        },
        {
            itemNumber: '003',
            defaults: {
                name: 'Escape from Ethmoria',
                price: 22.39,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Embark on a harrowing odyssey through the desolate lands of Ethmoria in "Escape from Ethmoria", a bone-chilling roleplaying game adventure that delves into the eerie aftermath of a fallen kingdom. Once ruled by a malevolent Lich Queen whose dark reign spanned centuries, Ethmoria now lies shattered and forsaken, haunted by the echoes of its sinister past. As brave adventurers, you must navigate treacherous landscapes and unravel the mysteries shrouding this forsaken realm, confronting vengeful spirits, eldritch horrors, and the lingering specter of the Lich Queen herself. Prepare to test the limits of courage and resilience as you chart a perilous course towards redemption or damnation in the haunted ruins of Ethmoria.',
                imageUrl: '/images/spooky.jpg',
                filePath: null,
                category: 'prewritten adventures',
                published: 1
            }
        },
        {
            itemNumber: '004',
            defaults: {
                name: 'Next Level Spellbook',
                price: 12.49,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Embark on a spellbinding journey to elevate your tabletop adventures with "Next Level Spellbook", the ultimate expansion for seasoned spellcasters and aspiring wizards alike. Unleash the arcane forces with hundreds of meticulously crafted spells, each designed to ignite new dimensions of creativity and excitement in your gameplay. From dazzling incantations that bend reality to whimsical charms that weave tales of wonder, "Next Level Spellbook" offers a treasure trove of magical possibilities. Explore diverse schools of magic, experiment with potent enchantments, and carve your path to mastery in the realms of fantasy. Elevate your spellcasting prowess to unprecedented heights and unlock boundless realms of imagination with "Next Level Spellbook" where every incantation opens the door to endless adventures.',
                imageUrl: '/images/wizard.jpeg',
                filePath: null,
                category: 'rule books',
                published: 1
            }
        },
        {
            itemNumber: '005',
            defaults: {
                name: 'Welcome to Xenoblade',
                price: 3.11,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Begin a fantastical new journey in the universe of Xenoblade Chronicles with this Dungeons & Dragons adventure module! Players will explore the expansive landscapes atop colossal Titans, uncover ancient technologies, and navigate the complex politics of different factions. As they quest for the legendary Aegis sword, heroes must forge alliances and combat fierce enemies, including Mechon invaders and mysterious Telethia. With rich lore, dynamic characters, and epic battles, this adventure promises to be an unforgettable addition to any gaming table.',
                imageUrl: '/images/xenoblade-square.jpg',
                filePath: null,
                category: 'prewritten adventures',
                published: 1

            }
        },
        {
            itemNumber: '006',
            defaults: {
                name: 'The Grand Bazaar Lantern',
                price: 2.50,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Introducing The Grand Bazaar Lantern, a unique magical item designed for the discerning Dungeons & Dragons adventurer. This enchanted lantern does more than light the dark corners of the world; it also captures and stores the essence of fallen creatures. Each soul enhances the lanterns glow and grants the bearer access to rare insights and arcane knowledge from the souls within. Perfect for illuminating hidden truths and unlocking the mysteries of the past, The Grand Bazaar Lantern is an indispensable tool for any quest!',
                imageUrl: '/images/grand-bazaar-lantern-square.jpg',
                filePath: null,
                category: 'magical items',
                published: 1
            }
        },
        {
            itemNumber: '007',
            defaults: {
                name: 'Eldritch Item Bundle',
                price: 8.00,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Discover the mysteries of the unknown with the Eldritch Item Bundle, a collection of arcane artifacts designed for Dungeons & Dragons adventurers who dare to delve into the supernatural. This bundle includes items like the Whispering Skull, which offers cryptic guidance and visions at a price; the Cloak of Starless Nights, which shrouds the wearer in shadows and silence; and the Sigil of Dreaming, a powerful amulet that allows manipulation of the dreamscape. Each piece is steeped in eerie power, perfect for those seeking to wield the darker, more enigmatic forces of the cosmos.',
                imageUrl: '/images/item-bundle-square.png',
                filePath: null,
                category: 'magical items',
                published: 1
            }
        },
        {
            itemNumber: '008',
            defaults: {
                name: 'Leporids: Rabbit People',
                price: 10.00,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Introducing the Leporids, a new playable race of rabbit people for Dungeons & Dragons! Known for their agility and keen senses, Leporids make excellent scouts and thieves. They possess a natural aptitude for evading danger, with abilities that enhance their speed and stealth. Leporids have a strong sense of community and a deep connection to nature, often aligning with classes like rangers and druids. Their unique racial traits include enhanced jumping capabilities and superior hearing. Players choosing to embody a Leporid will find themselves hopping into adventure with both charm and resilience!',
                imageUrl: '/images/rabbit-race-square.jpg',
                filePath: null,
                category: 'character options',
                published: 1
            }
        },
        {
            itemNumber: '009',
            defaults: {
                name: 'Mystras Chosen',
                price: 9.99,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Embark on a mystical quest in "Mystras Chosen," a prewritten Dungeons & Dragons adventure where players vie for the favor of Mystra, the goddess of magic. As contenders for the title of her champion, adventurers will navigate a series of arcane trials and complex puzzles across the magical weave itself. However, as the competition intensifies, it becomes clear that the mantle of Mystras champion carries a darker reality, filled with perilous responsibilities and unforeseen consequences. Will you embrace the power at the risk of everything you hold dear? Discover the true cost of divine favor in this thrilling campaign!',
                imageUrl: '/images/mystra.jpg',
                filePath: null,
                category: 'prewritten adventures',
                published: 0
            }
        },
        {
            itemNumber: '010',
            defaults: {
                name: 'Driders',
                price: 4.49,
                authorName: 'Jane Doe',
                authorWebsite: '/pages/userPage/authorPage',
                description: 'Dive into the shadows with our latest character options expansion, allowing players to assume the role of a Drider in Dungeons & Dragons. Born from the dark magic of Lolth, the spider queen, Driders merge the cunning intellect of dark elves with the terrifying form of giant spiders. This expansion provides players with detailed lore, abilities, and customization options to explore their transformation and navigate the complex dynamics of their new form. Whether outcast or revered, your Drider character will bring a unique blend of horror and intrigue to any campaign!',
                imageUrl: '/images/drider.jpg',
                filePath: null,
                category: 'character options',
                published: 0
            }
        },
        // ... (add other items similarly)
    ];

    for (const itemData of itemsToAdd) {
        await addItem(itemData);
    }
}

addItems().catch(error => {
    console.error("Error in addItems:", error);
});

module.exports = addItems;