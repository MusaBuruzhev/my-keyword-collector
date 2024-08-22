const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client'))); // Обслуживание статических файлов

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/keyword-url-db')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// API для работы с ключевыми словами и URL
const Keyword = require('./models/Keyword');


// Добавление ключевого слова и URL
app.post('/api/keywords', async (req, res) => {
    const { keyword, urls } = req.body;
    
    if (!keyword || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).send('Ключевое слово и список URL обязательны');
    }
    
    const newKeyword = new Keyword({ keyword, urls });
    await newKeyword.save();
    res.status(201).send(newKeyword);
});
// Получение URL по ключевому слову
app.get('/api/keywords/:keyword', async (req, res) => {
    const { keyword } = req.params;
    const keywordData = await Keyword.findOne({ keyword });
    if (!keywordData) {
        return res.status(404).send('Keyword not found');
    }
    res.send(keywordData.urls);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



const axios = require('axios');

// Скачивание контента по URL
app.get('/api/download', async (req, res) => {
    const { url } = req.query;
    
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.set('Content-Length', response.data.length);
        res.send(response.data);
    } catch (error) {
        console.error('Error downloading content:', error);
        res.status(500).send('Error downloading content');
    }
});