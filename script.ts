import mongoose from 'mongoose';
import dbConnect from './lib/dbConnect';
import User from './models/user';
import RDC from './models/rdc';
import Product from './models/product';
import Inventory from './models/inventory';

async function seedData() {
  try {
    await dbConnect();
    
    console.log('🌱 Seeding database with 5 RDCs...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      RDC.deleteMany({}),
      Product.deleteMany({}),
      Inventory.deleteMany({}),
    ]);

    console.log('✓ Cleared existing data');

    // ===========================================
    // CREATE 5 RDCs (Regional Distribution Centres)
    // ===========================================
    const rdcs = await RDC.create([
      {
        name: 'Colombo Metro RDC',
        location: 'Colombo',
        region: 'Western Province',
        address: '123 Port Access Road, Colombo 01',
        contactNumber: '011-2345678',
        isActive: true,
      },
      {
        name: 'Kandy Central RDC',
        location: 'Kandy',
        region: 'Central Province',
        address: '456 Peradeniya Road, Kandy',
        contactNumber: '081-2345678',
        isActive: true,
      },
      {
        name: 'Galle Southern RDC',
        location: 'Galle',
        region: 'Southern Province',
        address: '789 Colombo Road, Galle',
        contactNumber: '091-2345678',
        isActive: true,
      },
      {
        name: 'Jaffna Northern RDC',
        location: 'Jaffna',
        region: 'Northern Province',
        address: '321 KKS Road, Jaffna',
        contactNumber: '021-2345678',
        isActive: true,
      },
      {
        name: 'Batticaloa Eastern RDC',
        location: 'Batticaloa',
        region: 'Eastern Province',
        address: '555 Trinco Road, Batticaloa',
        contactNumber: '065-2345678',
        isActive: true,
      },
    ]);

    console.log(`✓ Created ${rdcs.length} RDCs:`, rdcs.map(r => r.name).join(', '));

    // ===========================================
    // CREATE USERS FOR ALL ROLES
    // ===========================================
    const users = await User.create([
      // Admin (1)
      {
        name: 'System Administrator',
        email: 'admin@islandlink.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
      },
      
      // RDC Staff (1 for each of the 5 RDCs)
      {
        name: 'Kamal Perera - Colombo RDC',
        email: 'colombo.staff@islandlink.com',
        password: 'staff123',
        role: 'rdc_staff',
        rdcId: rdcs[0]._id,
        isActive: true,
      },
      {
        name: 'Nimal Silva - Kandy RDC',
        email: 'kandy.staff@islandlink.com',
        password: 'staff123',
        role: 'rdc_staff',
        rdcId: rdcs[1]._id,
        isActive: true,
      },
      {
        name: 'Sunil Weerasinghe - Galle RDC',
        email: 'galle.staff@islandlink.com',
        password: 'staff123',
        role: 'rdc_staff',
        rdcId: rdcs[2]._id,
        isActive: true,
      },
      {
        name: 'Rajendran - Jaffna RDC',
        email: 'jaffna.staff@islandlink.com',
        password: 'staff123',
        role: 'rdc_staff',
        rdcId: rdcs[3]._id,
        isActive: true,
      },
      {
        name: 'Mohamed Rizvi - Batticaloa RDC',
        email: 'batticaloa.staff@islandlink.com',
        password: 'staff123',
        role: 'rdc_staff',
        rdcId: rdcs[4]._id,
        isActive: true,
      },
      
      // Logistics Officers (2 for different regions)
      {
        name: 'Dinesh Rathnayake - Western Logistics',
        email: 'logistics.western@islandlink.com',
        password: 'logistics123',
        role: 'logistics',
        rdcId: rdcs[0]._id, // Based in Colombo
        isActive: true,
      },
      {
        name: 'Suresh Kumar - Northern Logistics',
        email: 'logistics.northern@islandlink.com',
        password: 'logistics123',
        role: 'logistics',
        rdcId: rdcs[3]._id, // Based in Jaffna
        isActive: true,
      },
      
      // Head Office Managers (2)
      {
        name: 'Dr. Priyantha Fernando - CEO',
        email: 'ceo@islandlink.com',
        password: 'ho123',
        role: 'ho_manager',
        isActive: true,
      },
      {
        name: 'Ms. Kumari Jayawardena - Operations Director',
        email: 'operations@islandlink.com',
        password: 'ho123',
        role: 'ho_manager',
        isActive: true,
      },
      
      // Retail Customers (6)
      {
        name: 'John Silva - Supermarket',
        email: 'john.supermarket@example.com',
        password: 'customer123',
        role: 'customer',
        isActive: true,
      },
      {
        name: 'Mary Store - Grocery Store',
        email: 'mary.grocery@example.com',
        password: 'customer123',
        role: 'customer',
        isActive: true,
      },
    ]);

    console.log(`✓ Created ${users.length} users`);

    // ===========================================
    // CREATE PRODUCTS
    // ===========================================
    const products = await Product.create([
      // Rice & Grains
      {
        name: 'Basmati Rice',
        description: 'Premium quality imported Basmati rice, 10kg bag',
        price: 2800,
        category: 'Rice & Grains',
        unit: '10kg',
        image: '/images/products/basmati-rice.jpg',
        isActive: true,
      },
      {
        name: 'Nadu Rice',
        description: 'Local Nadu rice, 25kg bag',
        price: 3200,
        category: 'Rice & Grains',
        unit: '25kg',
        image: '/images/products/nadu-rice.jpg',
        isActive: true,
      },
      {
        name: 'Keeri Samba',
        description: 'Premium local Keeri Samba, 5kg bag',
        price: 1250,
        category: 'Rice & Grains',
        unit: '5kg',
        image: '/images/products/keeri-samba.jpg',
        isActive: true,
      },
      
      // Pulses
      {
        name: 'Red Dhal',
        description: 'Myanmar red dhal, 1kg pack',
        price: 380,
        category: 'Pulses',
        unit: '1kg',
        image: '/images/products/red-dhal.jpg',
        isActive: true,
      },
      {
        name: 'Green Gram',
        description: 'Local green gram, 500g pack',
        price: 240,
        category: 'Pulses',
        unit: '500g',
        image: '/images/products/green-gram.webp',
        isActive: true,
      },
      {
        name: 'Chickpeas',
        description: 'Imported chickpeas, 1kg pack',
        price: 450,
        category: 'Pulses',
        unit: '1kg',
        image: '/images/products/chickpeas.jpg',
        isActive: true,
      },
      
      // Cooking Oil
      {
        name: 'Coconut Oil',
        description: 'Pure coconut oil, 1L bottle',
        price: 890,
        category: 'Cooking Oil',
        unit: '1L',
        image: '/images/products/coconut-oil.jpg',
        isActive: true,
      },
      {
        name: 'Palm Oil',
        description: 'Refined palm oil, 2L bottle',
        price: 950,
        category: 'Cooking Oil',
        unit: '2L',
        image: '/images/products/palm-oil.jpg',
        isActive: true,
      },
      {
        name: 'Sunflower Oil',
        description: 'Imported sunflower oil, 1L bottle',
        price: 750,
        category: 'Cooking Oil',
        unit: '1L',
        image: '/images/products/sunflower-oil.jpeg',
        isActive: true,
      },
      
      // Flour & Baking
      {
        name: 'Wheat Flour',
        description: 'High protein wheat flour, 10kg bag',
        price: 1850,
        category: 'Flour & Baking',
        unit: '10kg',
        image: '/images/products/wheat-flour.webp',
        isActive: true,
      },
      {
        name: 'Self Raising Flour',
        description: 'Self raising flour with baking powder, 2kg pack',
        price: 420,
        category: 'Flour & Baking',
        unit: '2kg',
        image: '/images/products/self-raising-flour.jpg',
        isActive: true,
      },
      {
        name: 'Baking Powder',
        description: 'Double acting baking powder, 100g pack',
        price: 85,
        category: 'Flour & Baking',
        unit: '100g',
        image: '/images/products/baking-powder.jpg',
        isActive: true,
      },
      
      // Sugar & Sweeteners
      {
        name: 'White Sugar',
        description: 'Refined white sugar, 2kg pack',
        price: 490,
        category: 'Sugar & Sweeteners',
        unit: '2kg',
        image: '/images/products/white-sugar.jpg',
        isActive: true,
      },
      {
        name: 'Brown Sugar',
        description: 'Natural brown sugar, 1kg pack',
        price: 280,
        category: 'Sugar & Sweeteners',
        unit: '1kg',
        image: '/images/products/brown-sugar.jpg',
        isActive: true,
      },
      
      // Beverages
      {
        name: 'Ceylon Tea - Premium',
        description: 'BOP grade Ceylon black tea, 500g pack',
        price: 680,
        category: 'Beverages',
        unit: '500g',
        image: '/images/products/ceylon-tea.webp',
        isActive: true,
      },
      {
        name: 'Instant Coffee',
        description: 'Freeze-dried instant coffee, 200g jar',
        price: 1250,
        category: 'Beverages',
        unit: '200g',
        image: '/images/products/instant-coffee.webp',
        isActive: true,
      },
      {
        name: 'Chocolate Powder',
        description: 'Instant chocolate drink mix, 400g pack',
        price: 580,
        category: 'Beverages',
        unit: '400g',
        image: '/images/products/chocolate-powder.jpg',
        isActive: true,
      },
      
      // Canned Goods
      {
        name: 'Fish - Tinned',
        description: 'Tinned mackerel in tomato sauce, 425g',
        price: 450,
        category: 'Canned Goods',
        unit: '425g',
        image: '/images/products/tinned-fish.jpg',
        isActive: true,
      },
      {
        name: 'Baked Beans',
        description: 'Canned baked beans in tomato sauce, 400g',
        price: 320,
        category: 'Canned Goods',
        unit: '400g',
        image: '/images/products/baked-beans.jpeg',
        isActive: true,
      },
      
      // Dairy & Chilled
      {
        name: 'Milk Powder',
        description: 'Full cream milk powder, 1kg pack',
        price: 1450,
        category: 'Dairy & Chilled',
        unit: '1kg',
        image: '/images/products/milk-powder.webp',
        isActive: true,
      },
      {
        name: 'Margarine',
        description: 'Vegetable margarine, 500g block',
        price: 380,
        category: 'Dairy & Chilled',
        unit: '500g',
        image: '/images/products/margarine.jpg',
        isActive: true,
      },
      
      // Personal Care
      {
        name: 'Bath Soap',
        description: 'Premium bath soap, 4-pack',
        price: 380,
        category: 'Personal Care',
        unit: '4pcs',
        image: '/images/products/bath-soap.jpg',
        isActive: true,
      },
      {
        name: 'Toothpaste',
        description: 'Fluoride toothpaste, 150g tube',
        price: 290,
        category: 'Personal Care',
        unit: '150g',
        image: '/images/products/toothpaste.jpg',
        isActive: true,
      },
      
      // Cleaning Products
      {
        name: 'Washing Powder',
        description: 'Laundry washing powder, 2kg pack',
        price: 680,
        category: 'Cleaning Products',
        unit: '2kg',
        image: '/images/products/washing-powder.jpg',
        isActive: true,
      },
      {
        name: 'Dish Wash',
        description: 'Liquid dish washing soap, 1L bottle',
        price: 420,
        category: 'Cleaning Products',
        unit: '1L',
        image: '/images/products/dish-wash.jpg',
        isActive: true,
      },
    ]);

    console.log(`✓ Created ${products.length} products`);

    // ===========================================
    // CREATE INVENTORY FOR EACH OF THE 5 RDCs
    // ===========================================
    const inventoryItems:Record<string,string|Date|number>[] = [];
    
    for (const rdc of rdcs) {
      for (const product of products) {
        // Different stock levels for different RDCs
        let quantity;
        if (rdc.name.includes('Colombo')) {
          // Colombo RDC has higher stock
          quantity = Math.floor(Math.random() * 200) + 100;
        } else if (rdc.name.includes('Kandy') || rdc.name.includes('Galle')) {
          // Kandy & Galle have medium stock
          quantity = Math.floor(Math.random() * 150) + 50;
        } else {
          // Jaffna & Batticaloa have lower stock
          quantity = Math.floor(Math.random() * 80) + 20;
        }
        
        inventoryItems.push({
          productId: product._id,
          rdcId: rdc._id,
          quantity: quantity,
          minStockLevel: 30,
          maxStockLevel: 300,
          lastUpdated: new Date(),
        });
      }
    }

    await Inventory.insertMany(inventoryItems);
    console.log(`✓ Created ${inventoryItems.length} inventory records (${inventoryItems.length / rdcs.length} products × 5 RDCs)`);

    // ===========================================
    // SUMMARY
    // ===========================================
    console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('\n📊 SUMMARY:');
    console.log(`   - RDCs: 5`);
    console.log(`   - Users: ${users.length} (Admin: 1, RDC Staff: 5, Logistics: 2, HO Managers: 2, Customers: 6)`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Inventory Records: ${inventoryItems.length}`);
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   Admin: admin@islandlink.com / admin123');
    console.log('   RDC Staff (Colombo): colombo.staff@islandlink.com / staff123');
    console.log('   RDC Staff (Kandy): kandy.staff@islandlink.com / staff123');
    console.log('   RDC Staff (Galle): galle.staff@islandlink.com / staff123');
    console.log('   RDC Staff (Jaffna): jaffna.staff@islandlink.com / staff123');
    console.log('   RDC Staff (Batticaloa): batticaloa.staff@islandlink.com / staff123');
    console.log('   Logistics (Western): logistics.western@islandlink.com / logistics123');
    console.log('   Logistics (Northern): logistics.northern@islandlink.com / logistics123');
    console.log('   HO Manager (CEO): ceo@islandlink.com / ho123');
    console.log('   HO Manager (Ops): operations@islandlink.com / ho123');
    console.log('   Customer: john.supermarket@example.com / customer123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedData();
}

export default seedData;