const express = require('express');
const axios = require('axios');
const router = express.Router();

// 아두이노 서버 정보
const ARDUINO_IP = '192.168.219.180'; // 아두이노 IP 주소
const ARDUINO_PORT = 3001;           // 아두이노 HTTP 서버 포트

// 덮개 상태
let isFoldOpen = false; // 초기 덮개 상태

// 덮개 열기 (POST /cover/open)
router.post('/open', async (req, res) => {
  if (isFoldOpen) {
    return res.status(400).json({ error: '덮개가 이미 열려 있습니다.' });
  }

  try {
    // 아두이노로 열기 요청 전송
    const response = await axios.post(`http://${ARDUINO_IP}:${ARDUINO_PORT}/open`);
    isFoldOpen = true; // 로컬 상태 업데이트
    res.json({
      message: '덮개가 열렸습니다.',
      status: 'open',
      arduinoResponse: response.data,
    });
  } catch (error) {
    console.error('덮개 열기 오류:', error.message);
    res.status(500).json({ error: '덮개 열기 요청에 실패했습니다.' });
  }
});

// 덮개 닫기 (POST /cover/close)
router.post('/close', async (req, res) => {
  if (!isFoldOpen) {
    return res.status(400).json({ error: '덮개가 이미 닫혀 있습니다.' });
  }

  try {
    // 아두이노로 닫기 요청 전송
    const response = await axios.post(`http://${ARDUINO_IP}:${ARDUINO_PORT}/close`);
    isFoldOpen = false; // 로컬 상태 업데이트
    res.json({
      message: '덮개가 닫혔습니다.',
      status: 'closed',
      arduinoResponse: response.data,
    });
  } catch (error) {
    console.error('덮개 닫기 오류:', error.message);
    res.status(500).json({ error: '덮개 닫기 요청에 실패했습니다.' });
  }
});

// 덮개 상태 조회 (GET /cover/status)
router.get('/status', async (req, res) => {
  try {
    // 아두이노로 상태 조회 요청
    const response = await axios.get(`http://${ARDUINO_IP}:${ARDUINO_PORT}/status`);
    res.json({
      currentCoverStatus: isFoldOpen ? 'open' : 'closed',
      arduinoStatus: response.data,
    });
  } catch (error) {
    console.error('덮개 상태 조회 오류:', error.message);
    res.status(500).json({ error: '덮개 상태 조회 요청에 실패했습니다.' });
  }
});

// 덮개 상태 초기화 (POST /cover/reset)
router.post('/reset', async (req, res) => {
  try {
    // 아두이노로 초기화 요청 전송
    const response = await axios.post(`http://${ARDUINO_IP}:${ARDUINO_PORT}/reset`);
    isFoldOpen = false; // 로컬 상태 초기화
    res.json({
      message: '덮개 상태가 초기화되었습니다.',
      status: 'closed',
      arduinoResponse: response.data,
    });
  } catch (error) {
    console.error('덮개 초기화 요청 오류:', error.message);
    res.status(500).json({ error: '덮개 초기화 요청에 실패했습니다.' });
  }
});

module.exports = router;
