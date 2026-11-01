const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// منع التخزين المؤقت
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// تقديم جميع الملفات من مجلد public بشكل مباشر
app.use(express.static(path.join(__dirname, 'public')));

// API المنتجات
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/products', (req, res) => {
    const { name, price, category, image, description, supplierPhone, supplierUrl } = req.body;
    db.run(
        "INSERT INTO products (name, price, category, image, description, supplierPhone) VALUES (?, ?, ?, ?, ?, ?)",
        [name, price, category || 'عام', image, description, supplierPhone || '213777083158'],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "تم إضافة المنتج بنجاح!" });
        }
    );
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "تم حذف المنتج بنجاح!" });
    });
});

// API الطلبات
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/orders', (req, res) => {
    const { productId, quantity, totalPrice } = req.body;
    db.run(
        "INSERT INTO orders (productId, quantity, totalPrice) VALUES (?, ?, ?)",
        [productId, quantity, totalPrice],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "تم تسجيل الطلب!" });
        }
    );
});

// التوجيه الذكي للملفات
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`VOLT 2.0 Server running on port ${PORT}`);
});
