const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, './shortlinks.json');

// ✅ โหลดข้อมูล
const loadLinks = () => {
  if (!fs.existsSync(dataPath)) return [];
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
};

// ✅ บันทึกข้อมูล
const saveLinks = (links) => {
  fs.writeFileSync(dataPath, JSON.stringify(links, null, 2), 'utf8');
};

// ✅ สร้างโค้ดสุ่ม 4 ตัว (ไทย+อังกฤษ)
const generateCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789กขคงจฉชซญณดตถทนบปผพฟภมยรลวศษสหฬอฮ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// ✅ POST /short/create
router.post('/create', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'ต้องส่ง URL มาด้วย' });

  const links = loadLinks();
  let code;
  do {
    code = generateCode();
  } while (links.find((l) => l.code === code));

  links.push({ code, url });
  saveLinks(links);

  res.json({ code });
});

// ✅ GET /short/:code → redirect
router.get('/:code', (req, res) => {
  const code = req.params.code;
  const links = loadLinks();
  const entry = links.find((l) => l.code === code);

  if (entry) {
    res.redirect(entry.url);
  } else {
    res.status(404).send('ไม่พบลิงก์นี้ครับ');
  }
});

module.exports = router;
