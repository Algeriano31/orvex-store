const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'volt.json');

const initialData = {
    products: [
        {
            id: 1,
            name: "سماعات بلوتوث لاسلكية VIP",
            price: 29.99,
            category: "إلكترونيات",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
            description: "سماعات ذات جودة عالية لعزل الضوضاء بطارية تدوم 24 ساعة.",
            supplierPhone: "213777083158"
        },
        {
            id: 2,
            name: "ساعة ذكية مقاومة للماء",
            price: 49.99,
            category: "إلكترونيات",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
            description: "ساعة ذكية مع متتبع لنبضات القلب والأنشطة الرياضية.",
            supplierPhone: "213777083158"
        }
    ],
    orders: []
};

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

function readDB() {
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        return initialData;
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const db = {
    all: (query, params, callback) => {
        const data = readDB();
        if (query.includes('products')) {
            callback(null, data.products);
        } else if (query.includes('orders')) {
            callback(null, data.orders);
        } else {
            callback(null, []);
        }
    },
    run: (query, params, callback) => {
        const data = readDB();
        if (query.includes('INSERT INTO products')) {
            const newProduct = {
                id: Date.now(),
                name: params[0],
                price: params[1],
                category: params[2],
                image: params[3],
                description: params[4],
                supplierPhone: params[5]
            };
            data.products.push(newProduct);
            writeDB(data);
            if (callback) callback.call({ lastID: newProduct.id }, null);
        } else if (query.includes('INSERT INTO orders')) {
            const newOrder = {
                id: Date.now(),
                productId: params[0],
                quantity: params[1],
                totalPrice: params[2],
                created_at: new Date().toISOString()
            };
            data.orders.push(newOrder);
            writeDB(data);
            if (callback) callback.call({ lastID: newOrder.id }, null);
        } else if (query.includes('DELETE FROM products')) {
            data.products = data.products.filter(p => p.id != params[0]);
            writeDB(data);
            if (callback) callback(null);
        }
    }
};

module.exports = db;
